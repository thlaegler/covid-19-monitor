package com.covid19.service;

import static java.time.format.DateTimeFormatter.ISO_DATE;
import static java.time.format.DateTimeFormatter.ofPattern;
import static java.util.Collections.emptyMap;
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
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
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
import com.covid19.model.OwidTesting;
import com.covid19.repo.CountryEsRepo;
import com.covid19.repo.Covid19SnapshotEsRepo;
import com.covid19.rest.FollowRedirectRestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
public class ImportService extends CsvService {

  private static final String COVID19_URL =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/%s.csv";

  private static final String TESTING_CSV_URL =
      "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/testing/covid-testing-all-observations.csv";

  private static final String SOURCE_URL = "https://github.com/CSSEGISandData/COVID-19";

  private static final String IMPORT_COUNTRY_PATH = "sources/countries.csv";

  private static final String IMPORT_COVID19_CSV_PATH = "sources/covid19/%s.csv";

  private static final String IMPORT_TESTING_CSV_PATH = "sources/test_capacity.csv";

  private static final DateTimeFormatter INTERNAL_DATE_FORMAT = ISO_DATE;

  private static final DateTimeFormatter DAILY_FILE_DATE_FORMAT = ofPattern("MM-dd-yyyy");

  private final FollowRedirectRestTemplate followRedirectRestTemplate;

  private final Covid19SnapshotEsRepo covid19SnapshotRepo;

  private final CountryEsRepo countryRepo;

  public Map<String, Country> importCountries() {
    return StreamSupport
        .stream(countryRepo.saveAll(readCsv(IMPORT_COUNTRY_PATH, Country.class).map(c -> {
          c.getId();
          return c;
        }).collect(toList())).spliterator(), true)
        .collect(toMap(Country::getId, Function.identity(), (a, b) -> b, HashMap::new));
  }

  public Map<String, OwidTesting> importOwidTesting() {
    log.info("Importing Testing Data");

    final File csvFile = new File(IMPORT_TESTING_CSV_PATH);

    // Download CSV
    try {
      followRedirectRestTemplate.execute(TESTING_CSV_URL, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(csvFile));
        return csvFile;
      });
    } catch (Exception ex) {
      log.error("Cannot fetch Testing Data from {}", TESTING_CSV_URL, ex);
      return emptyMap();
    }

    List<OwidTesting> rawTestings = readCsv(IMPORT_TESTING_CSV_PATH, OwidTesting.class).map(t -> {
      t.setCountry(t.getCountry()//
          .replace(" - units unclear", "")//
          .replace(" - tests performed", "")//
          .replace(" - tests analysed", "")//
          .replace(" - analysed samples", "")//
          .replace(" - people tested", "")//
          .replace(" - samples tested", "")//
          .replace(" - tests sampled", "")//
          .replace(" - cases tested", "")//
          .replace(" - samples analyzed", "")//
          .replace(" - swabs tested", "")//
          .replace(" - inconsistent units (COVID Tracking Project)", "")//
          .replace(" - specimens tested (CDC)", "")//
      );
      return t;
    }).collect(toList());

    Map<String, List<OwidTesting>> testingByCountry =
        rawTestings.stream().sorted((a, b) -> b.getCountry().compareTo(a.getCountry()))
            .collect(groupingBy(t -> t.getCountry()));

    testingByCountry.entrySet().stream().forEach(e -> {
      // Duplicates of same date (e.g US)
      Map<String, OwidTesting> testCountryByDate = e.getValue().stream()//
          .sorted((a, b) -> b.getDateId().compareTo(a.getDateId()))//
          .collect(toMap(t -> t.getDateId(), t -> t, (a, b) -> {
            b.setTotal(b.getTotal() + a.getTotal());
            b.setDelta(b.getDelta() + a.getDelta());
            b.setPer1k(b.getPer1k() + a.getPer1k());
            return b;
          }, HashMap::new));


      List<Covid19Snapshot> testsAdded =
          StreamSupport.stream(covid19SnapshotRepo.findByCountry(e.getKey()).spliterator(), false)
              .sorted((a, b) -> a.getDateId().compareTo(b.getDateId()))
              // .filter(snap -> dateIds.contains(snap.getDateId()))
              .map(snap -> {
                OwidTesting dat = testCountryByDate.get(snap.getDateId());
                if (dat != null) {
                  snap.setTested(dat.getTotal());
                  snap.setTestedDelta(Double.valueOf(dat.getDelta()).longValue());
                  snap.setTestedPer1k(dat.getPer1k());
                }
                return snap;
              }).collect(toList());

      final AtomicLong prevTotal = new AtomicLong(0);
      final AtomicLong prevDelta = new AtomicLong(0);
      final AtomicReference<Double> prevPer1k = new AtomicReference<>(0.0);

      testsAdded.stream().forEach(snap -> {
        if (snap.getTested() <= 0) {
          snap.setTested(prevTotal.get());
        }
        prevTotal.set(snap.getTested());

        if (snap.getTestedDelta() <= 0) {
          snap.setTestedDelta(prevDelta.get());
        }
        prevDelta.set(snap.getTestedDelta());

        if (snap.getTestedPer1k() <= 0) {
          snap.setTestedPer1k(prevPer1k.get());
        }
        prevPer1k.set(snap.getTestedPer1k());
      });

      covid19SnapshotRepo.saveAll(testsAdded);
      log.info("Finished importing of Testing Data for country {}", e.getKey());
    });

    log.info("Finished importing of Testing Data");

    return null;
  }

  public boolean importAllDailyReports(String importStartDate) {
    LocalDate currentDate = LocalDate.of(2020, 1, 22); // From Start
    if (importStartDate != null) {
      currentDate = LocalDate.parse(importStartDate, INTERNAL_DATE_FORMAT);
    }
    final Map<String, Covid19Snapshot> previousDay = new HashMap<>();

    Map<String, Country> countries = countryRepo.findAll(PageRequest.of(0, 9999, ASC, "country"))
        .getContent().stream().collect(toMap(c -> c.getCountry(), c -> c));

    // China early days
    if (currentDate.isBefore(LocalDate.of(2020, 1, 22))) {
      readCsv("sources/china_early_days.csv", DailyReport.class).forEach(dr -> {
        String earlyDateId = dr.getLastUpdate();
        dr.setCountry(sanitizeCountryName(dr.getCountry()));
        dr.setDateId(earlyDateId);
        dr.setInfectious(dr.getInfectious() != 0 ? dr.getInfectious()
            : (dr.getConfirmed() - dr.getRecovered() - dr.getDeceased()));
        dr.getId();

        Map<String, Covid19Snapshot> snaps = new HashMap<>();
        countries.values().forEach(c -> {
          if (c.getCountry().equalsIgnoreCase(dr.getCountry())) {
            snaps.put(c.getCountry(), buildSnap(dr, c, previousDay));
          } else {
            snaps.put(c.getCountry(),
                buildSnap(DailyReport.builder().dateId(earlyDateId).country(c.getCountry()).build(),
                    c, previousDay));
          }
        });
        previousDay.clear();
        previousDay.putAll(snaps);
        covid19SnapshotRepo.saveAll(snaps.values());
        log.info("Imported early days {}", earlyDateId);
      });

      try {
        Thread.sleep(2000);
      } catch (InterruptedException ex) {
        log.error("Cannot sleep", ex);
      }
    }

    previousDay.clear();
    previousDay.putAll(StreamSupport.stream(covid19SnapshotRepo
        .findByDateId(currentDate.minusDays(1).format(INTERNAL_DATE_FORMAT)).spliterator(), false)
        .collect(toMap(f -> f.getCountry(), f -> f, (a, b) -> b, HashMap::new)));
    log.info("Importing all Daily Reports starting from of {}",
        currentDate.format(INTERNAL_DATE_FORMAT));

    // Import each day
    while (currentDate.isBefore(LocalDate.now())) {
      Map<String, Covid19Snapshot> intermediateResult =
          importDailyReportsByDate(currentDate, previousDay, countries);
      previousDay.clear();
      previousDay.putAll(intermediateResult);
      currentDate = currentDate.plusDays(1);
    }

    // calculateAdditionalValues(countries);

    log.info("Finished data import");

    importOwidTesting();

    return true;
  }

  public Map<String, Covid19Snapshot> importDailyReportsByDate(LocalDate date,
      Map<String, Covid19Snapshot> previousDay, Map<String, Country> countries) {
    String csvDate = date.format(DAILY_FILE_DATE_FORMAT);
    String dateId = date.format(INTERNAL_DATE_FORMAT);

    log.info("Importing Daily Report of {}", dateId);

    final String csvFilePath = String.format(IMPORT_COVID19_CSV_PATH, csvDate);
    final File csvFile = new File(csvFilePath);

    // Download CSV
    String url = String.format(COVID19_URL, csvDate);
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
          .filter(dr2 -> dr2.getCountry() != null).map(dr2 -> {
            DailyReport dr = DailyReport.builder()//
                .dateId(dateId)//
                .country(sanitizeCountryName(dr2.getCountry()))//
                .provinceState(
                    dr2.getProvinceState() + ":" + dr2.getFips() + ":" + dr2.getAdministration())//
                .confirmed(dr2.getConfirmed())//
                .recovered(dr2.getRecovered())//
                .deceased(dr2.getDeceased())//
                .infectious(dr2.getInfectious())//
                .lastUpdate(dr2.getLastUpdate())//
                .build();
            dr.setInfectious(dr.getInfectious() != 0 ? dr.getInfectious()
                : (dr.getConfirmed() - dr.getRecovered() - dr.getDeceased()));
            dr.getId();
            return dr;
          }).collect(toList()));
    } else {
      dailyReportList.addAll(readCsv(csvFilePath, DailyReport.class).map(dr -> {
        dr.setCountry(sanitizeCountryName(dr.getCountry()));
        dr.setDateId(dateId);
        dr.setInfectious(dr.getInfectious() != 0 ? dr.getInfectious()
            : (dr.getConfirmed() - dr.getRecovered() - dr.getDeceased()));
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
          .confirmed(provinces.stream().filter(dr -> dr.getConfirmed() != 0)
              .mapToLong(dr -> dr.getConfirmed()).sum())//
          .recovered(provinces.stream().filter(dr -> dr.getRecovered() != 0)
              .mapToLong(dr -> dr.getRecovered()).sum())//
          .deceased(provinces.stream().filter(dr -> dr.getDeceased() != 0)
              .mapToLong(dr -> dr.getDeceased()).sum())//
          .infectious(provinces.stream().filter(dr -> dr.getInfectious() != 0)
              .mapToLong(dr -> dr.getInfectious()).sum())//
          .build();
      agg.getId();
      return agg;
    }).collect(toList());

    List<String> aggCountries =
        aggregatedCountries.stream().map(c -> c.getCountry()).collect(toList());
    List<DailyReport> allDailyReports = dailyReportList.stream()
        .filter(report -> !aggCountries.contains(report.getCountry())).collect(toList());
    allDailyReports.addAll(aggregatedCountries);

    // World Total
    Long worldConfirmed = allDailyReports.stream().filter(dr -> dr.getConfirmed() != 0)
        .mapToLong(dr -> dr.getConfirmed()).sum();
    Long worldRecovered = allDailyReports.stream().filter(dr -> dr.getRecovered() != 0)
        .mapToLong(dr -> dr.getRecovered()).sum();
    Long worldDeceased = allDailyReports.stream().filter(dr -> dr.getDeceased() != 0)
        .mapToLong(dr -> dr.getDeceased()).sum();
    Long worldInfectious = allDailyReports.stream().filter(dr -> dr.getInfectious() != 0)
        .mapToLong(dr -> dr.getInfectious()).sum();
    DailyReport world = DailyReport.builder()//
        .dateId(dateId)//
        .country("World")//
        .confirmed(worldConfirmed)//
        .recovered(worldRecovered)//
        .deceased(worldDeceased)//
        .infectious(worldInfectious)//
        .lastUpdate(LocalDateTime.now(ZoneId.of("UTC")).format(INTERNAL_DATE_FORMAT))//
        .build();
    world.getId();
    allDailyReports.add(world);

    // For each Country set nulls to 0 and add additional calculated values
    Map<String, DailyReport> dailyReportsByCountry = allDailyReports.stream()
        .collect(toMap(dr -> dr.getCountry(), dr -> dr, (a, b) -> b, HashMap::new));
    List<Covid19Snapshot> finalSnapshots = new ArrayList<>();

    countries.entrySet().forEach(e -> {
      String countryId = e.getKey();
      Country country = e.getValue();
      DailyReport report =
          ofNullable(dailyReportsByCountry.get(countryId)).orElse(DailyReport.builder()
              .dateId(dateId).confirmed(0L).recovered(0L).country(countryId).deceased(0L).build());

      Covid19Snapshot snap = buildSnap(report, country, previousDay);

      finalSnapshots.add(snap);
    });

    covid19SnapshotRepo.saveAll(finalSnapshots);

    log.info("Finished Import of Daily Report with {} countries", allDailyReports.size());
    return finalSnapshots.stream()
        .collect(toMap(f -> f.getCountry(), f -> f, (a, b) -> b, HashMap::new));
  }

  private Covid19Snapshot buildSnap(DailyReport report, Country country,
      Map<String, Covid19Snapshot> previousDay) {
    report.setConfirmed(report.getConfirmed() != 0 ? report.getConfirmed() : 0L);
    report.setRecovered(report.getRecovered() != 0 ? report.getRecovered() : 0L);
    report.setDeceased(report.getDeceased() != 0 ? report.getDeceased() : 0L);
    report.setInfectious(report.getInfectious() != 0 ? report.getInfectious() : 0L);
    report.getId();

    Covid19Snapshot snap = Covid19Snapshot.builder()//
        .country(country.getCountry())//
        .countryCode(country.getCountryCode())//
        .dateId(report.getDateId())//
        .dayId(LocalDate.parse(report.getDateId(), INTERNAL_DATE_FORMAT).getDayOfYear())//
        .confirmed(report.getConfirmed())//
        .recovered(report.getRecovered())//
        .deceased(report.getDeceased())//
        .infectious(report.getInfectious())//
        .source(SOURCE_URL)//
        .build();


    // If we have data from day before
    if (previousDay != null && !previousDay.isEmpty()) {
      Covid19Snapshot prev = previousDay.get(country.getCountry());
      if (prev != null && snap.getConfirmed() != 0) {

        if (snap.getConfirmed() == 0 && prev.getConfirmed() != 0) {
          snap.setConfirmed(prev.getConfirmed());
        }
        if (snap.getRecovered() == 0 && prev.getRecovered() != 0) {
          snap.setRecovered(prev.getRecovered());
        }
        if (snap.getDeceased() == 0 && prev.getDeceased() != 0) {
          snap.setDeceased(prev.getDeceased());
        }
        if (snap.getInfectious() == 0 && prev.getInfectious() != 0) {
          snap.setInfectious(prev.getInfectious());
        }

        snap.setConfirmedGrowthRate(0.0);
        snap.setConfirmedDelta(0);
        if (prev.getConfirmed() != 0) {
          snap.setConfirmedGrowthRate(1.0 * snap.getConfirmed() / prev.getConfirmed());
          snap.setConfirmedDelta(snap.getConfirmed() - prev.getConfirmed());
        }

        snap.setRecoveredGrowthRate(0.0);
        snap.setRecoveredDelta(0);
        if (prev.getRecovered() != 0) {
          snap.setRecoveredGrowthRate(1.0 * snap.getRecovered() / prev.getRecovered());
          snap.setRecoveredDelta(snap.getRecovered() - prev.getRecovered());
        }

        snap.setDeceasedGrowthRate(0.0);
        snap.setDeceasedDelta(0);
        if (prev.getDeceased() != 0) {
          snap.setDeceasedGrowthRate(1.0 * snap.getDeceased() / prev.getDeceased());
          snap.setDeceasedDelta(snap.getDeceased() - prev.getDeceased());
        }

        snap.setInfectiousGrowthRate(0.0);
        snap.setInfectiousDelta(0);
        if (prev.getInfectious() != 0) {
          snap.setInfectiousGrowthRate(1.0 * snap.getInfectious() / prev.getInfectious());
          snap.setInfectiousDelta(snap.getInfectious() - prev.getInfectious());
        }
      }
    }

    // If we have sufficient country details
    if (country != null && country.getPopulationAbsolute() != null) {
      snap.setIncidencePer100k(snap.getConfirmed() / (country.getPopulationAbsolute() / 100000.0));
      snap.setImmunizationRate(1.0 * snap.getRecovered() / country.getPopulationAbsolute());
    }

    if (snap.getConfirmedGrowthRate() > 0 && snap.getConfirmedGrowthRate() != 1.0) {
      double doublingTime = Math.log(2) / Math.log(snap.getConfirmedGrowthRate());
      snap.setDoublingTime(Double.isFinite(doublingTime) ? doublingTime : null);
    }

    if (snap.getConfirmed() != 0) {
      if (snap.getRecovered() != 0) {
        Double recoveryRate = 1.0 * snap.getRecovered() / snap.getConfirmed();
        snap.setRecoveryRate(
            recoveryRate.isNaN() || recoveryRate.isInfinite() ? 0.0 : recoveryRate);
      }
      if (snap.getDeceased() != 0) {
        Double lethalityRate = 1.0 * snap.getDeceased() / snap.getConfirmed();
        snap.setCaseFatalityRisk(
            lethalityRate.isNaN() || lethalityRate.isInfinite() ? 0.0 : lethalityRate);
      }
    }
    snap.getId();

    return snap;
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
