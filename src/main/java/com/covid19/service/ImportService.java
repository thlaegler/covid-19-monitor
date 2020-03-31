package com.covid19.service;

import static java.time.format.DateTimeFormatter.ISO_DATE;
import static java.time.format.DateTimeFormatter.ofPattern;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static org.springframework.data.domain.Sort.Direction.ASC;
import static org.springframework.http.HttpMethod.GET;
import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.StreamSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import com.covid19.model.Country;
import com.covid19.model.Covid19Snapshot;
import com.covid19.model.DailyReport;
import com.covid19.model.DailyReport2;
import com.covid19.repo.CountryEsRepo;
import com.covid19.repo.Covid19SnapshotEsRepo;
import com.covid19.rest.FollowRedirectRestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
public class ImportService extends CsvService {

  private static final String CSV_DOWNLOAD_URL =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/%s.csv";

  private static final String SOURCE_URL = "https://github.com/CSSEGISandData/COVID-19";

  private static final String IMPORT_CSV_PATH = "data/import/%s.csv";

  private static final DateTimeFormatter INTERNAL_DATE_FORMAT = ISO_DATE;

  private static final DateTimeFormatter DAILY_FILE_DATE_FORMAT = ofPattern("MM-dd-yyyy");

  private final FollowRedirectRestTemplate followRedirectRestTemplate;

  private final Covid19SnapshotEsRepo covid19SnapshotRepo;

  private final CountryEsRepo countryRepo;

  public Map<String, Country> importCountries() {
    return StreamSupport
        .stream(countryRepo.saveAll(readCsv("data/countries.csv", Country.class).map(c -> {
          c.getId();
          return c;
        }).collect(toList())).spliterator(), true)
        .collect(toMap(Country::getId, Function.identity(), (a, b) -> b, HashMap::new));
  }

  public boolean importAllDailyReports(String importStartDate) {
    LocalDate currentDate = LocalDate.of(2020, 1, 22); // From Start
    Map<String, Covid19Snapshot> previousDay = null;

    if (importStartDate != null) {
      currentDate = LocalDate.parse(importStartDate, INTERNAL_DATE_FORMAT);
      previousDay = StreamSupport.stream(covid19SnapshotRepo
          .findByDateId(currentDate.minusDays(1).format(INTERNAL_DATE_FORMAT)).spliterator(), false)
          .collect(toMap(f -> f.getCountry(), f -> f, (a, b) -> b, HashMap::new));
    }
    log.info("Importing all Daily Reports starting from of {}",
        currentDate.format(INTERNAL_DATE_FORMAT));

    Map<String, Country> countries = countryRepo.findAll(PageRequest.of(0, 9999, ASC, "country"))
        .getContent().stream().collect(toMap(c -> c.getCountry(), c -> c));

    // Import each day
    while (currentDate.isBefore(LocalDate.now())) {
      previousDay = importDailyReportsByDate(currentDate, previousDay, countries);
      currentDate = currentDate.plusDays(1);
    }

    // calculateAdditionalValues(countries);

    log.info("Finished data import");

    return true;
  }

  public Map<String, Covid19Snapshot> importDailyReportsByDate(LocalDate date,
      Map<String, Covid19Snapshot> previousDay, Map<String, Country> countries) {
    String csvDate = date.format(DAILY_FILE_DATE_FORMAT);
    String dateId = date.format(INTERNAL_DATE_FORMAT);

    log.info("Importing Daily Report of {}", dateId);

    final String csvFilePath = String.format(IMPORT_CSV_PATH, csvDate);
    final File csvFile = new File(csvFilePath);

    // Download CSV
    String url = String.format(CSV_DOWNLOAD_URL, csvDate);
    try {
      followRedirectRestTemplate.execute(url, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(csvFile));
        return csvFile;
      });
    } catch (Exception ex) {
      log.error("Cannot fetch Daily Report for {} from {}", dateId, url, ex);
      return Collections.emptyMap();
    }

    // Read CSV
    final List<DailyReport> dailyReportList = new ArrayList<>();
    if ((date.getMonth().getValue() >= 4)
        || (date.getMonth().getValue() == 3 && date.getDayOfMonth() >= 22)) {
      dailyReportList.addAll(readCsv(csvFilePath, DailyReport2.class)
          .filter(dr -> dr.getCountry() != null).map(dr2 -> {
            DailyReport it = DailyReport.builder()//
                .dateId(dateId)//
                .country(sanitizeCountryName(dr2.getCountry()))//
                .provinceState(
                    dr2.getProvinceState() + ":" + dr2.getFips() + ":" + dr2.getAdministration())//
                .deceased(dr2.getDeceased())//
                .confirmed(dr2.getConfirmed())//
                .recovered(dr2.getRecovered())//
                .lastUpdate(dr2.getLastUpdate())//
                .build();
            it.getId();
            return it;
          }).collect(toList()));
    } else {
      dailyReportList.addAll(readCsv(csvFilePath, DailyReport.class).map(dr -> {
        dr.setCountry(sanitizeCountryName(dr.getCountry()));
        dr.setDateId(dateId);
        dr.getId();
        return dr;
      }).collect(toList()));
    }

    dailyReportList.sort((a, b) -> a.getCountry().compareToIgnoreCase(b.getCountry()));

    // Aggregate Provinces to Country and remove Provinces
    List<List<DailyReport>> groupedByCountry = dailyReportList.stream().filter(Objects::nonNull)
        .collect(groupingBy(DailyReport::getCountry, toList()))//
        .values().stream().filter(Objects::nonNull).filter(drs -> drs != null && drs.size() > 1)
        .collect(toList());
    final List<DailyReport> aggregatedCountries = groupedByCountry.stream().map(drs -> {
      List<DailyReport> provinces = drs.stream().filter(Objects::nonNull).collect(toList());
      DailyReport agg = DailyReport.builder()//
          .dateId(dateId)//
          .country(drs.get(0).getCountry())//
          .confirmed(provinces.stream().filter(dr -> dr.getConfirmed() != null)
              .mapToLong(dr -> dr.getConfirmed()).sum())//
          .recovered(provinces.stream().filter(dr -> dr.getRecovered() != null)
              .mapToLong(dr -> dr.getRecovered()).sum())//
          .deceased(provinces.stream().filter(dr -> dr.getDeceased() != null)
              .mapToLong(dr -> dr.getDeceased()).sum())//
          .build();
      agg.getId();
      // dailyReportList.removeAll(provinces);
      // provinces.forEach(dr -> dailyReportList.remove(dr));
      return agg;
    }).collect(toList());

    List<String> aggCountries =
        aggregatedCountries.stream().map(c -> c.getCountry()).collect(toList());
    List<DailyReport> allDailyReports = dailyReportList.stream()
        .filter(report -> !aggCountries.contains(report.getCountry())).collect(toList());
    allDailyReports.addAll(aggregatedCountries);

    // World Total
    Long worldConfirmed = allDailyReports.stream().filter(dr -> dr.getConfirmed() != null)
        .mapToLong(dr -> dr.getConfirmed().longValue()).sum();
    Long worldRecovered = allDailyReports.stream().filter(dr -> dr.getRecovered() != null)
        .mapToLong(dr -> dr.getRecovered().longValue()).sum();
    Long worldDeceased = allDailyReports.stream().filter(dr -> dr.getDeceased() != null)
        .mapToLong(dr -> dr.getDeceased().longValue()).sum();
    DailyReport world = DailyReport.builder()//
        .dateId(dateId)//
        .country("World")//
        .confirmed(worldConfirmed)//
        .recovered(worldRecovered)//
        .deceased(worldDeceased)//
        .lastUpdate(LocalDateTime.now(ZoneId.of("UTC")).format(INTERNAL_DATE_FORMAT))//
        .build();
    world.getId();
    allDailyReports.add(world);

    // For each Country set nulls to 0 and add additional calculated values
    Map<String, DailyReport> dailyReportsByCountry = allDailyReports.stream()
        .collect(toMap(dr -> dr.getCountry(), dr -> dr, (a, b) -> b, HashMap::new));
    List<Covid19Snapshot> finalSnapshots = new ArrayList<>();
    boolean hasPrevious = previousDay != null && !previousDay.isEmpty();
    countries.entrySet().forEach(e -> {
      String countryId = e.getKey();
      Country country = e.getValue();
      DailyReport report =
          ofNullable(dailyReportsByCountry.get(countryId)).orElse(DailyReport.builder()
              .dateId(dateId).confirmed(0L).recovered(0L).country(countryId).deceased(0L).build());
      report.setConfirmed(report.getConfirmed() != null ? report.getConfirmed() : 0L);
      report.setRecovered(report.getRecovered() != null ? report.getRecovered() : 0L);
      report.setDeceased(report.getDeceased() != null ? report.getDeceased() : 0L);
      report.getId();

      Covid19Snapshot snap = Covid19Snapshot.builder()//
          .country(e.getValue().getCountry())//
          .countryCode(e.getValue().getCountryCode())//
          .dateId(report.getDateId())//
          .dayId(LocalDate.parse(report.getDateId(), INTERNAL_DATE_FORMAT).getDayOfYear())//
          .confirmed(report.getConfirmed())//
          .recovered(report.getRecovered())//
          .deceased(report.getDeceased())//
          .source(SOURCE_URL)//
          .build();


      // If we have data from day before
      if (hasPrevious) {
        Covid19Snapshot prev = previousDay.get(e.getKey());
        if (prev != null && prev.getConfirmed() != null && snap.getConfirmed() > 0) {

          snap.setConfirmedGrowthRate(0.0);
          snap.setConfirmedDelta(0);
          if (prev.getConfirmed() != null && prev.getConfirmed() > 0) {
            snap.setConfirmedGrowthRate(
                snap.getConfirmed().doubleValue() / prev.getConfirmed().doubleValue());
            snap.setConfirmedDelta(snap.getConfirmed().intValue() - prev.getConfirmed().intValue());
          }
          snap.setRecoveredGrowthRate(0.0);
          snap.setRecoveredDelta(0);
          if (prev.getRecovered() != null && prev.getRecovered() > 0) {
            snap.setRecoveredGrowthRate(
                snap.getRecovered().doubleValue() / prev.getRecovered().doubleValue());
            snap.setRecoveredDelta(snap.getRecovered().intValue() - prev.getRecovered().intValue());
          }
          snap.setDeceasedGrowthRate(0.0);
          snap.setDeceasedDelta(0);
          if (prev.getDeceased() != null && prev.getDeceased() > 0) {
            snap.setDeceasedGrowthRate(
                snap.getDeceased().doubleValue() / prev.getDeceased().doubleValue());
            snap.setDeceasedDelta(snap.getDeceased().intValue() - prev.getDeceased().intValue());
          }
        }
      }

      // If we have sufficient country details
      if (country != null && country.getPopulationAbsolute() != null) {
        snap.setIncidencePer100k(snap.getConfirmed().doubleValue()
            / (country.getPopulationAbsolute().doubleValue() / 100000));
        snap.setImmunizationRate(
            snap.getRecovered().doubleValue() / country.getPopulationAbsolute().doubleValue());
      }

      if (snap.getConfirmedGrowthRate() != null) {
        double doublingTime = Math.log(2) / Math.log(snap.getConfirmedGrowthRate());
        snap.setDoublingTime(Double.isFinite(doublingTime) ? doublingTime : null);
      }

      if (snap.getConfirmed() != null && snap.getConfirmed() > 0) {
        if (snap.getRecovered() != null && snap.getRecovered() > 0) {
          Double recoveryRate =
              snap.getRecovered().doubleValue() / snap.getConfirmed().doubleValue();
          snap.setRecoveryRate(
              recoveryRate.isNaN() || recoveryRate.isInfinite() ? 0.0 : recoveryRate);
        }
        if (snap.getDeceased() != null && snap.getDeceased() > 0) {
          Double lethalityRate =
              snap.getDeceased().doubleValue() / snap.getConfirmed().doubleValue();
          snap.setCaseFatalityRisk(
              lethalityRate.isNaN() || lethalityRate.isInfinite() ? 0.0 : lethalityRate);
        }
      }
      snap.getId();

      finalSnapshots.add(snap);
    });

    covid19SnapshotRepo.saveAll(finalSnapshots);

    log.info("Finished Import of Daily Report with {} countries", allDailyReports.size());
    return finalSnapshots.stream()
        .collect(toMap(f -> f.getCountry(), f -> f, (a, b) -> b, HashMap::new));
  }

  private String sanitizeCountryName(String countryName) {
    if (countryName.equalsIgnoreCase("Taipei and environs")
        || countryName.equalsIgnoreCase("Taiwan*")) {
      return "Taiwan";
    } else if (countryName.equalsIgnoreCase("Mainland China")) {
      return "China";
    } else if (countryName.equalsIgnoreCase("Hong Kong SAR")) {
      return "Hong Kong";
    } else if (countryName.equalsIgnoreCase("Macao SAR") || countryName.equalsIgnoreCase("Macau")) {
      return "Macao";
    } else if (countryName.equalsIgnoreCase("Republic of Korea")
        || countryName.equalsIgnoreCase("Korea, South")) {
      return "South Korea";
    } else if (countryName.equalsIgnoreCase("Iran (Islamic Republic of)")) {
      return "Iran";
    } else if (countryName.equalsIgnoreCase("US")) {
      return "United States";
    } else if (countryName.equalsIgnoreCase("UK")) {
      return "United Kingdom";
    } else if (countryName.equalsIgnoreCase("Congo (Kinshasa)")) {
      return "Congo";
    } else if (countryName.equalsIgnoreCase("Congo (Kinshasa)")) {
      return "Congo";
    } else if (countryName.equalsIgnoreCase("Czechia")) {
      return "Czech Republic";
    } else if (countryName.equalsIgnoreCase("Côte d'Ivoire")) {
      return "Cote d'Ivoire";
    } else if (countryName.equalsIgnoreCase("Netherlands, The")) {
      return "Netherlands";
    } else if (countryName.equalsIgnoreCase("Réunion")) {
      return "Reunion";
    } else if (countryName.equalsIgnoreCase("Russian Federation")
        || countryName.equalsIgnoreCase("Russian Federation, The")) {
      return "Russia";
    } else if (countryName.equalsIgnoreCase("Gambia, The")) {
      return "Gambia";
    } else if (countryName.equalsIgnoreCase("Viet Nam")) {
      return "Vietnam";
    } else if (countryName.equalsIgnoreCase("occupied Palestinian territory")
        || countryName.equalsIgnoreCase("The West Bank and Gaza")
        || countryName.equalsIgnoreCase("West Bank and Gaza")
        || countryName.equalsIgnoreCase("Palestinian Territories")
        || countryName.equalsIgnoreCase("State of Palestine")) {
      return "Palestine";
    } else if (countryName.equalsIgnoreCase("Diamond Princess")
        || countryName.equalsIgnoreCase("Cruise Ship") || countryName.equalsIgnoreCase("Others")) {
      return "Diamond Princess Cruise Ship";
    } else if (countryName.equalsIgnoreCase("MS Zaandam")) {
      return "Zaandam Cruise Ship";
    } else if (countryName.equalsIgnoreCase("Burma")) {
      return "Myanmar";
    } else if (countryName.equalsIgnoreCase("Vatican City")
        || countryName.equalsIgnoreCase("Vatican")) {
      return "Holy See";
    } else if (countryName.equalsIgnoreCase("Bahamas, The")) {
      return "Bahamas";
    } else if (countryName.equalsIgnoreCase("Saint Vincent and the Grenadines")) {
      return "St. Vincent & Grenadines";
    } else if (countryName.equalsIgnoreCase("Saint Kitts and Nevis")) {
      return "Saint Kitts & Nevis";
    } else if (countryName.equalsIgnoreCase("Swiss")) {
      return "Switzerland";
    } else if (countryName.equalsIgnoreCase("UAE")) {
      return "United Arab Emirates";
    }
    return countryName;
  }

}
