package com.covid19.service;

import static java.time.format.DateTimeFormatter.BASIC_ISO_DATE;
import static java.time.format.DateTimeFormatter.ISO_DATE;
import static java.time.format.DateTimeFormatter.ofPattern;
import static java.util.Collections.emptyMap;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static org.springframework.data.domain.Sort.Direction.ASC;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.util.CollectionUtils.isEmpty;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.StreamSupport;
import javax.imageio.ImageIO;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StreamUtils;
import com.covid19.model.AppleMobility;
import com.covid19.model.Country;
import com.covid19.model.Covid19Snapshot;
import com.covid19.model.DailyReport;
import com.covid19.model.DailyReport2;
import com.covid19.model.GoogleMobility;
import com.covid19.model.HealthRestriction;
import com.covid19.model.JohnsHopkinsTimeSerie;
import com.covid19.model.ResponseStringency;
import com.covid19.model.Testing;
import com.covid19.model.TravelRestriction;
import com.covid19.repo.CountryEsRepo;
import com.covid19.repo.Covid19SnapshotEsRepo;
import com.covid19.rest.FollowRedirectRestTemplate;
import com.google.common.util.concurrent.AtomicDouble;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
public class ImportService extends CsvService {

  private static final String SOURCE_URL = "https://github.com/CSSEGISandData/COVID-19";

  private static final String COVID19_URL =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/%s.csv";
  private static final String COVID19_CONFIRMED_URL =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
  private static final String COVID19_RECOVERED_URL =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";
  private static final String COVID19_DECEASED_URL =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";

  private static final String TESTING_CSV_URL =
      "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/testing/covid-testing-all-observations.csv";
  private static final String HEALTH_RESTRICTION_CSV_URL =
      "https://s3-us-west-1.amazonaws.com/starschema.covid/HDX_ACAPS.csv";
  private static final String TRAVEL_RESTRICTION_CSV_URL =
      "https://s3-us-west-1.amazonaws.com/starschema.covid/HUM_RESTRICTIONS_COUNTRY.csv";
  private static final String APPLE_MOBILITY_URL =
      "https://covid19-static.cdn-apple.com/covid19-mobility-data/2007HotfixDev51/v2/en-us/applemobilitytrends-%s.csv";
  private static final String GOOGLE_MOBILITY_URL =
      "https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv";
  private static final String RESPONSE_STRINGENCY_URL =
      "https://raw.githubusercontent.com/OxCGRT/covid-policy-tracker/master/data/OxCGRT_latest.csv";

  private static final String DOW_JONES_URL =
      "https://www.spindices.com/idsexport/file.xls?hostIdentifier=48190c8c-42c4-46af-8d1a-0cd5db894797&selectedModule=PerformanceGraphView&selectedSubModule=Graph&yearFlag=oneYearFlag&indexId=1720081";
  private static final String OILPRICE_BRENT_URL =
      "https://datahub.io/core/oil-prices/r/brent-daily.csv";
  private static final String OILPRICE_WTI_URL =
      "https://datahub.io/core/oil-prices/r/wti-daily.csv";

  private static final String IMPORT_COUNTRY_PATH = "sources/countries.csv";
  private static final String IMPORT_COVID19_CSV_PATH = "sources/covid19/%s.csv";
  private static final String IMPORT_COVID19_CONFIRMED_CSV_PATH = "sources/covid19/confirmed.csv";
  private static final String IMPORT_COVID19_RECOVERED_CSV_PATH = "sources/covid19/recovered.csv";
  private static final String IMPORT_COVID19_DECEASED_CSV_PATH = "sources/covid19/deceased.csv";

  private static final String IMPORT_TESTING_CSV_PATH = "sources/test_capacities.csv";
  private static final String HEALTH_RESTRICTION_CSV_PATH = "sources/health_restrictions.csv";
  private static final String TRAVEL_RESTRICTION_CSV_PATH = "sources/travel_restrictions.csv";
  private static final String APPLE_MOBILITY_CSV_PATH = "sources/apple_mobility.csv";
  private static final String GOOGLE_MOBILITY_CSV_PATH = "sources/google_mobility.csv";

  private static final String RESPONSE_STRINGENCY_CSV_PATH = "sources/response_stringency.csv";

  private static final DateTimeFormatter INTERNAL_DATE_FORMAT = ISO_DATE;
  private static final DateTimeFormatter DAILY_FILE_DATE_FORMAT = ofPattern("MM-dd-yyyy");
  private static final DateTimeFormatter TIMESERIES_DATE_FORMAT = ofPattern("M/d/yy");

  private static final DateTimeFormatter STARSCHEMA_DATE_FORMAT =
      ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");
  private static final DateTimeFormatter STRINGENCY_DATE_FORMAT = BASIC_ISO_DATE;

  private final FollowRedirectRestTemplate followRedirectRestTemplate;

  private final Covid19SnapshotEsRepo covid19SnapshotRepo;

  private final CountryEsRepo countryRepo;

  // @Async
  // public void importAllInOneAsync() {
  // // importCountries();
  // Map<String, Map<String, Covid19Snapshot>> covid19Snaphots = new HashMap<>();
  //
  // Map<String, Country> countries = getCountries();
  // Map<String, Covid19Snapshot> covid19EarlyDays = getCovid19chinaEarlyDays();
  // Map<String, Covid19Snapshot> dailyReports = getCovid19chinaEarlyDays();
  //
  // importAllDailyReports(importStartDate);
  // importAllTimeSeries();
  //
  // importTesting();
  // importRestrictions();
  // importResponseStringency();
  // importAppleMobility();
  // importGoogleMobility();
  //
  // log.info("Finished all Imports");
  // }

  @Async
  public void importAllAsync(String importStartDate) {
    // importCountries();

    importAllDailyReports(importStartDate);
    importAllTimeSeries();

    importTesting();
    importRestrictions();
    importResponseStringency();
    importAppleMobility();
    importGoogleMobility();

    log.info("Finished all Imports");
  }

  public Map<String, Country> importCountries() {
    return StreamSupport
        .stream(countryRepo.saveAll(readCsv(IMPORT_COUNTRY_PATH, Country.class, false).map(c -> {
          c.setCountry(sanitizeCountryName(c.getCountry()));
          c.getId();
          return c;
        }).collect(toList())).spliterator(), true)
        .collect(toMap(Country::getId, Function.identity(), (a, b) -> b, HashMap::new));
  }

  public Map<String, Testing> importTesting() {
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

    List<Testing> rawTestings = readCsv(IMPORT_TESTING_CSV_PATH, Testing.class, false).map(t -> {
      t.setCountry(sanitizeCountryName(t.getCountry()));
      return t;
    }).collect(toList());

    Map<String, List<Testing>> testingByCountry =
        rawTestings.stream().sorted((a, b) -> b.getCountry().compareTo(a.getCountry()))
            .collect(groupingBy(t -> t.getCountry()));

    testingByCountry.entrySet().stream().forEach(e -> {
      // Duplicates of same date (e.g US)
      Map<String, Testing> testCountryByDate = e.getValue().stream()//
          .sorted((a, b) -> b.getDateId().compareTo(a.getDateId()))//
          .collect(toMap(t -> t.getDateId(), t -> t, (a, b) -> {
            b.setTotal(b.getTotal() + a.getTotal());
            b.setDelta(b.getDelta() + a.getDelta());
            b.setPer1k(b.getPer1k() + a.getPer1k());
            return b;
          }, HashMap::new));


      List<Covid19Snapshot> testsAdded = StreamSupport
          .stream(covid19SnapshotRepo.findByCountryOrderByDateIdAsc(e.getKey()).spliterator(),
              false)
          .sorted((a, b) -> a.getDateId().compareTo(b.getDateId()))
          // .filter(snap -> dateIds.contains(snap.getDateId()))
          .map(snap -> {
            Testing dat = testCountryByDate.get(snap.getDateId());
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
      log.info("Finished Import of Testing Data for country {}", e.getKey());
    });

    log.info("Finished Import of Testing Data");

    return null;
  }

  public Map<String, Testing> importRestrictions() {
    log.info("Importing Restrictions Data");

    Map<String, Country> countries = countryRepo.findAll(PageRequest.of(0, 9999, ASC, "country"))
        .getContent().stream().collect(toMap(c -> c.getCountry(), c -> c));

    final File travelCsvFile = new File(TRAVEL_RESTRICTION_CSV_PATH);
    final File healthCsvFile = new File(HEALTH_RESTRICTION_CSV_PATH);

    // Download CSV
    try {
      followRedirectRestTemplate.execute(TRAVEL_RESTRICTION_CSV_URL, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(travelCsvFile));
        return travelCsvFile;
      });
      followRedirectRestTemplate.execute(HEALTH_RESTRICTION_CSV_URL, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(healthCsvFile));
        return healthCsvFile;
      });
    } catch (Exception ex) {
      log.error("Cannot fetch Restrictions Data from {} or {}", TRAVEL_RESTRICTION_CSV_URL,
          HEALTH_RESTRICTION_CSV_URL, ex);
      return emptyMap();
    }

    Map<String, List<TravelRestriction>> travelRestr =
        readCsv(TRAVEL_RESTRICTION_CSV_PATH, TravelRestriction.class, true).map(x -> {
          x.setDateId(StringUtils.isBlank(x.getPublished()) ? null
              : INTERNAL_DATE_FORMAT.format(STARSCHEMA_DATE_FORMAT.parse(x.getPublished())));
          x.setCountry(sanitizeCountryName(x.getCountry()));
          x.setRestriction(x.getRestriction().replace(System.getProperty("line.separator"), "<br>")
              .replace("\\n", "<br>"));
          x.setQuarantine(x.getQuarantine().replace(System.getProperty("line.separator"), "<br>")
              .replace("\\n", "<br>"));
          return x;
        }).collect(groupingBy(TravelRestriction::getCountry, toList()));

    Map<String, List<HealthRestriction>> healthRestr =
        readCsv(HEALTH_RESTRICTION_CSV_PATH, HealthRestriction.class, false).map(x -> {
          x.setDateId((!StringUtils.isBlank(x.getDateImplemented())
              && !x.getDateImplemented().equalsIgnoreCase("Not applicable"))
                  ? INTERNAL_DATE_FORMAT
                      .format(STARSCHEMA_DATE_FORMAT.parse(x.getDateImplemented()))
                  : (!StringUtils.isBlank(x.getEntryDate())
                      ? INTERNAL_DATE_FORMAT.format(STARSCHEMA_DATE_FORMAT.parse(x.getEntryDate()))
                      : "2020-xx-xx"));
          x.setCountry(sanitizeCountryName(x.getCountry()));
          x.setComments(x.getComments().replace(System.getProperty("line.separator"), "<br>")
              .replace("\\n", "<br>"));
          return x;
        }).collect(groupingBy(HealthRestriction::getCountry, toList()));

    countries.entrySet().forEach(e -> {
      String cn = e.getKey();
      Country c = e.getValue();
      boolean hasData = false;

      List<TravelRestriction> ts = travelRestr.get(cn);
      if (!CollectionUtils.isEmpty(ts)) {
        ts = travelRestr.get(cn).stream().collect(toMap(x -> x.getDateId(), x -> x, (a, b) -> {
          a.setRestriction(a.getRestriction() + "<br>" + b.getRestriction());
          a.setQuarantine(a.getQuarantine() + "<br>" + b.getQuarantine());
          a.setSourceUrl(a.getSourceUrl() + "<br>" + b.getSourceUrl());
          return a;
        }, HashMap::new)).values().stream().collect(toList());

        ts.sort((a, b) -> (-1) * a.getDateId().compareToIgnoreCase(b.getDateId()));
        final StringBuilder travelRestriction = new StringBuilder();
        ts.forEach(t -> {
          travelRestriction.append(" <h4>Restrictions</h4> ");
          travelRestriction.append(t.getRestriction());
          travelRestriction.append(" <h4>Quarantine</h4> ");
          travelRestriction.append(t.getQuarantine());
          travelRestriction.append(" <h4>Sources</h4> ");
          travelRestriction.append(t.getSourceUrl());
        });
        c.setTravelRestriction(buildHyperlinks(travelRestriction.toString()));
        hasData = true;
      }

      List<HealthRestriction> hs = healthRestr.get(cn);
      if (!CollectionUtils.isEmpty(hs)) {
        hs.sort((a, b) -> (-1) * a.getDateId().compareToIgnoreCase(b.getDateId()));

        Map<String, List<HealthRestriction>> hr =
            hs.stream().collect(groupingBy(HealthRestriction::getDateId, toList()));

        Map<String, String> allHealthRes =
            hr.entrySet().stream().collect(toMap(e2 -> e2.getKey(), e2 -> {
              final StringBuilder healthRestriction = new StringBuilder();

              healthRestriction.append("<h4>");
              healthRestriction.append(e2.getKey());
              healthRestriction.append("</h4>");
              healthRestriction.append("<ul>");
              e2.getValue().forEach(h -> {
                healthRestriction.append("<li>");
                healthRestriction.append(h.getCategory());
                healthRestriction.append(": ");
                healthRestriction.append(h.getMeasure());
                healthRestriction.append(".<br>");
                healthRestriction.append(h.getComments());
                healthRestriction.append("<br>Source: ");
                healthRestriction.append(h.getSource());
                healthRestriction.append(" (");
                healthRestriction.append(h.getSourceType());
                healthRestriction.append("), ");
                healthRestriction.append(h.getSourceUrl());
                healthRestriction.append(" ");
                healthRestriction.append("</li>");
              });
              healthRestriction.append("</ul>");
              return healthRestriction.toString();
            })).entrySet().stream().sorted(Map.Entry.comparingByKey()).collect(
                toMap(a -> a.getKey(), a -> a.getValue(), (a, b) -> b, LinkedHashMap::new));

        c.setHealthRestriction(
            buildHyperlinks(allHealthRes.values().stream().collect(joining("<br>"))));

        hasData = true;
      }

      if (hasData) {
        countryRepo.save(c);

        log.info("Finished Import of Restriction Data for {}", cn);
      }
    });

    log.info("Finished Import of Restriction Data");

    return null;
  }

  public Map<String, ResponseStringency> importResponseStringency() {
    log.info("Importing Response Stringency Data");

    final File csvFile = new File(RESPONSE_STRINGENCY_CSV_PATH);

    try {
      followRedirectRestTemplate.execute(RESPONSE_STRINGENCY_URL, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(csvFile));
        return csvFile;
      });
    } catch (Exception ex) {
      log.error("Cannot fetch Response Stringency Data from {} or {}", RESPONSE_STRINGENCY_URL, ex);
      return emptyMap();
    }

    Map<String, List<ResponseStringency>> byCountry =
        readCsv(RESPONSE_STRINGENCY_CSV_PATH, ResponseStringency.class, false).map(m -> {
          m.setCountry(sanitizeCountryName(m.getCountry()));
          m.setDateId(
              LocalDate.parse(m.getDate(), STRINGENCY_DATE_FORMAT).format(INTERNAL_DATE_FORMAT));
          return m;
        }).collect(groupingBy(ResponseStringency::getCountry, toList()));

    byCountry.entrySet().forEach(e -> {
      String cn = e.getKey();
      List<ResponseStringency> values = e.getValue().stream()
          .sorted((a, b) -> a.getDateId().compareToIgnoreCase(b.getDateId())).collect(toList());
      final AtomicDouble previous = new AtomicDouble(0.0);
      List<Covid19Snapshot> newSnaps = StreamSupport
          .stream(covid19SnapshotRepo.findByCountryOrderByDateIdAsc(cn).spliterator(), false)
          .map(snap -> {
            String dateId = snap.getDateId();
            double responseStringency = values.stream()
                .filter(v -> v.getStringencyIndex() > 0 && v.getDateId().equalsIgnoreCase(dateId))
                .map(v -> v.getStringencyIndex()).findFirst().orElse(previous.get());
            snap.setResponseStringency(responseStringency);
            previous.set(responseStringency);
            return snap;
          }).collect(toList());
      covid19SnapshotRepo.saveAll(newSnaps);
      log.info("Finished Import of Response Stringency Data for {}", cn);
    });

    log.info("Finished Import of Response Stringency Data");

    return null;
  }

  public Map<String, Object> importMortality() {
    log.info("Importing Mortality Data");

    final File csvFile = new File(RESPONSE_STRINGENCY_CSV_PATH);

    try {
      followRedirectRestTemplate.execute(RESPONSE_STRINGENCY_URL, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(csvFile));
        return csvFile;
      });
    } catch (Exception ex) {
      log.error("Cannot fetch Mortality Data from {} or {}", RESPONSE_STRINGENCY_URL, ex);
      return emptyMap();
    }

    Map<String, List<ResponseStringency>> byCountry =
        readCsv(RESPONSE_STRINGENCY_CSV_PATH, ResponseStringency.class, false).map(m -> {
          m.setCountry(sanitizeCountryName(m.getCountry()));
          m.setDateId(
              LocalDate.parse(m.getDate(), STRINGENCY_DATE_FORMAT).format(INTERNAL_DATE_FORMAT));
          return m;
        }).collect(groupingBy(ResponseStringency::getCountry, toList()));

    byCountry.entrySet().forEach(e -> {
      String cn = e.getKey();
      List<ResponseStringency> values = e.getValue().stream()
          .sorted((a, b) -> a.getDateId().compareToIgnoreCase(b.getDateId())).collect(toList());
      final AtomicDouble previous = new AtomicDouble(0.0);
      List<Covid19Snapshot> newSnaps = StreamSupport
          .stream(covid19SnapshotRepo.findByCountryOrderByDateIdAsc(cn).spliterator(), false)
          .map(snap -> {
            String dateId = snap.getDateId();
            double responseStringency = values.stream()
                .filter(v -> v.getStringencyIndex() > 0 && v.getDateId().equalsIgnoreCase(dateId))
                .map(v -> v.getStringencyIndex()).findFirst().orElse(previous.get());
            snap.setResponseStringency(responseStringency);
            previous.set(responseStringency);
            return snap;
          }).collect(toList());
      covid19SnapshotRepo.saveAll(newSnaps);
      log.info("Finished Import of Mortality Data for {}", cn);
    });

    log.info("Finished Import of Mortality Data");

    return null;
  }

  public Map<String, AppleMobility> importAppleMobility() {
    log.info("Importing Apple Mobility Data");

    final String appleUrl = String.format(APPLE_MOBILITY_URL,
        LocalDate.now().minusDays(2).format(INTERNAL_DATE_FORMAT));
    final File appleCsvFile = new File(APPLE_MOBILITY_CSV_PATH);
    try {
      followRedirectRestTemplate.execute(appleUrl, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(appleCsvFile));
        return appleCsvFile;
      });
    } catch (Exception ex) {
      log.error("Cannot fetch Apple Mobility Data from {}", appleUrl, ex);
      return emptyMap();
    }

    Map<String, List<AppleMobility>> appleByCountry =
        readCsv(APPLE_MOBILITY_CSV_PATH, AppleMobility.class, false)
            .filter(m -> m.getGeoType().equalsIgnoreCase("country/region")).map(m -> {
              m.setCountry(sanitizeCountryName(m.getCountry()));
              return m;
            }).collect(groupingBy(AppleMobility::getCountry, toList()));

    appleByCountry.entrySet().forEach(e -> {
      String cn = e.getKey();
      List<AppleMobility> values = e.getValue();
      final AtomicDouble previous = new AtomicDouble(100.0);
      List<Covid19Snapshot> newSnaps = StreamSupport
          .stream(covid19SnapshotRepo.findByCountryOrderByDateIdAsc(cn).spliterator(), false)
          .map(snap -> {
            String dateId = snap.getDateId();
            double mob = values.stream()
                .filter(v -> v.getDateValues() != null && !isEmpty(v.getDateValues().get(dateId)))
                .mapToDouble(
                    v -> v.getDateValues().get(dateId).stream().findFirst().orElse(previous.get()))
                .average().orElse(previous.get());
            snap.setAppleMobility(mob);
            previous.set(mob);
            return snap;
          }).collect(toList());
      covid19SnapshotRepo.saveAll(newSnaps);
      log.info("Finished Import of Apple Mobility Data for {}", cn);
    });

    log.info("Finished Import of Apple Mobility Data");

    return null;
  }

  public Map<String, GoogleMobility> importGoogleMobility() {
    log.info("Importing Google Mobility Data");

    final File googleCsvFile = createFile(GOOGLE_MOBILITY_CSV_PATH);

    try {
      followRedirectRestTemplate.execute(GOOGLE_MOBILITY_URL, GET, null, resp -> {
        StreamUtils.copy(resp.getBody(), new FileOutputStream(googleCsvFile));
        return googleCsvFile;
      });
    } catch (Exception ex) {
      log.error("Cannot fetch Google Mobility Data from {}", GOOGLE_MOBILITY_URL, ex);
      return emptyMap();
    }
    Map<String, List<GoogleMobility>> googleByCountry =
        readCsv(GOOGLE_MOBILITY_CSV_PATH, GoogleMobility.class, false).map(m -> {
          m.setCountry(sanitizeCountryName(m.getCountry()));
          return m;
        }).collect(groupingBy(GoogleMobility::getCountry, toList()));

    googleByCountry.entrySet().forEach(e -> {
      String cn = e.getKey();
      List<GoogleMobility> values = e.getValue();
      Map<String, GoogleMobility> byDate = values.stream()
          .collect(groupingBy(GoogleMobility::getDateId, toList())).entrySet().stream()//
          .collect(toMap(e1 -> e1.getKey(), e1 -> {
            return GoogleMobility.builder().dateId(e.getKey()).country(cn)
                .groceryPharmacy(e1.getValue().stream().mapToDouble(x -> x.getGroceryPharmacy())
                    .average().orElse(0))
                .residential(
                    e1.getValue().stream().mapToDouble(x -> x.getResidential()).average().orElse(0))
                .retailRecreation(e1.getValue().stream().mapToDouble(x -> x.getRetailRecreation())
                    .average().orElse(0))
                .park(e1.getValue().stream().mapToDouble(x -> x.getPark()).average().orElse(0))
                .workplace(
                    e1.getValue().stream().mapToDouble(x -> x.getWorkplace()).average().orElse(0))
                .transit(
                    e1.getValue().stream().mapToDouble(x -> x.getTransit()).average().orElse(0))
                .build();
          }));

      final AtomicDouble previous = new AtomicDouble(0.0);
      List<Covid19Snapshot> newSnaps = StreamSupport
          .stream(covid19SnapshotRepo.findByCountryOrderByDateIdAsc(cn).spliterator(), false)
          .map(snap -> {
            GoogleMobility lol = byDate.get(snap.getDateId());
            if (lol != null) {
              double neww = (lol.getGroceryPharmacy() + lol.getPark() + lol.getWorkplace()
                  + lol.getTransit() + lol.getRetailRecreation() + lol.getResidential()) / 6;
              snap.setGoogleMobility(neww != 0 ? neww : previous.get());
              // snap.setGoogleMobilityGroceryPharmacy(lol.getGroceryPharmacy());
              // snap.setGoogleMobilityPark(lol.getPark());
              // snap.setGoogleMobilityWorkplace(lol.getWorkplace());
              // snap.setGoogleMobilityTransit(lol.getTransit());
              // snap.setGoogleMobilityRetailRecreation(lol.getRetailRecreation());
              // snap.setGoogleMobilityResidential(lol.getResidential());
              previous.set(snap.getGoogleMobility());
            } else {
              snap.setGoogleMobility(previous.get());
            }
            return snap;
          }).filter(Objects::nonNull).collect(toList());
      if (!CollectionUtils.isEmpty(newSnaps)) {
        covid19SnapshotRepo.saveAll(newSnaps);
      }
      log.info("Finished Import of Google Mobility Data for {}", cn);
    });

    log.info("Finished Import of Google Mobility Data");

    return null;
  }

  public void importAllTimeSeries() {
    log.info("Importing COVID-19 Timeseries Data");

    try {
      Map<String, JohnsHopkinsTimeSerie> confirmed =
          fetchCovid19Timeseries(COVID19_CONFIRMED_URL, IMPORT_COVID19_CONFIRMED_CSV_PATH);
      Map<String, JohnsHopkinsTimeSerie> recovered =
          fetchCovid19Timeseries(COVID19_RECOVERED_URL, IMPORT_COVID19_RECOVERED_CSV_PATH);
      Map<String, JohnsHopkinsTimeSerie> deceased =
          fetchCovid19Timeseries(COVID19_DECEASED_URL, IMPORT_COVID19_DECEASED_CSV_PATH);

      confirmed.entrySet().forEach(e -> {
        String countryName = e.getKey();
        Country country = countryRepo.findById(countryName).orElse(null);
        if (country == null) {
          log.warn("Unknown Country: {}", countryName);
        } else {
          List<Covid19Snapshot> snaps = covid19SnapshotRepo
              .findByCountryOrderByDateIdAsc(countryName, PageRequest.of(0, 9999)).getContent()
              .stream().filter(snap -> confirmed.get(countryName).getDateIdValues()
                  .containsKey(snap.getDateId()))
              .map(snap -> {
                String dateId = snap.getDateId();
                Long confirmed1 = confirmed.get(countryName).getDateIdValues().get(dateId);
                Long recovered1 = recovered.get(countryName).getDateIdValues().get(dateId);
                Long deceased1 = deceased.get(countryName).getDateIdValues().get(dateId);

                snap.setConfirmed(confirmed1 != null ? confirmed1 : 0);
                snap.setRecovered(recovered1 != null ? recovered1 : 0);
                snap.setDeceased(deceased1 != null ? deceased1 : 0);
                return snap;
              }).collect(toList());

          covid19SnapshotRepo.saveAll(addCalculatedValues(country, snaps));
          log.info("Updated {} Snapshots for {} with Timeseries Data", snaps.size(), countryName);
        }
      });

    } catch (Exception ex) {
      log.error("Cannot fetch COVID-19 Timeseries Data from {} or {} or {}", COVID19_CONFIRMED_URL,
          COVID19_RECOVERED_URL, COVID19_DECEASED_URL, ex);
      return;
    }
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
      readCsv("sources/china_early_days.csv", DailyReport.class, false).forEach(dr -> {
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

    if (currentDate.isBefore(LocalDate.of(2020, 1, 22))) {
      currentDate = LocalDate.of(2020, 1, 22);
    }

    previousDay.clear();
    previousDay.putAll(StreamSupport.stream(covid19SnapshotRepo
        .findByDateId(currentDate.minusDays(1).format(INTERNAL_DATE_FORMAT)).spliterator(), false)
        .collect(toMap(f -> f.getCountry(), f -> f, (a, b) -> b)));
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

    // importTesting();

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
      dailyReportList.addAll(readCsv(csvFilePath, DailyReport2.class, false)
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
      dailyReportList.addAll(readCsv(csvFilePath, DailyReport.class, false).map(dr -> {
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

  private Map<String, JohnsHopkinsTimeSerie> fetchCovid19Timeseries(String url, String csvPath) {
    final File csvFile = new File(csvPath);
    followRedirectRestTemplate.execute(url, GET, null, resp -> {
      StreamUtils.copy(resp.getBody(), new FileOutputStream(csvFile));
      return csvFile;
    });

    return readCsv(csvPath, JohnsHopkinsTimeSerie.class, false).map(j -> {
      j.setCountry(sanitizeCountryName(j.getCountry()));
      j.setDateIdValues(j.getDateValues().asMap().entrySet().stream()
          .collect(toMap(
              e -> LocalDate.parse(e.getKey(), TIMESERIES_DATE_FORMAT).format(INTERNAL_DATE_FORMAT),
              e -> e.getValue().iterator().next())));
      j.setDateValues(null);
      return j;
    }).collect(toMap(j -> j.getCountry(), j -> j, (a, b) -> {
      a.getDateIdValues().entrySet()
          .forEach(en -> en.setValue(en.getValue() + b.getDateIdValues().get(en.getKey())));
      return a;
    }, HashMap::new));
  }

  private List<Covid19Snapshot> addCalculatedValues(Country country,
      List<Covid19Snapshot> sortedCountrySnaps) {
    final AtomicReference<Covid19Snapshot> previousDay = new AtomicReference<>(null);

    return sortedCountrySnaps.stream().map(snap -> {
      if (snap.getInfectious() == 0) {
        snap.setInfectious(snap.getConfirmed() - snap.getRecovered() - snap.getDeceased());
      }
      if (previousDay.get() != null) {

        Covid19Snapshot prev = previousDay.get();

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
        snap.setIncidencePer100k(
            snap.getConfirmed() / (country.getPopulationAbsolute() / 100000.0));
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
      previousDay.set(snap);

      return snap;
    }).collect(toList());
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
        // .source(SOURCE_URL)//
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
    countryName = countryName//
        .replace(" - units unclear", "")//
        .replace(" - tests performed", "")//
        .replace(" - tests analysed", "")//
        .replace(" - analysed samples", "")//
        .replace(" - people tested", "")//
        .replace(" - People tested", "")//
        .replace(" - samples tested", "")//
        .replace(" - tests sampled", "")//
        .replace(" - cases tested", "")//
        .replace(" - samples analyzed", "")//
        .replace(" - samples analysed", "")//
        .replace(" - swabs tested", "")//
        .replace(" - samples processed", "")//
        .replace(" - samples", "")//
        .replace(" - inconsistent units (COVID Tracking Project)", "")//
        .replace(" - specimens tested (CDC)", "")//
        .trim();

    if (countryName.equalsIgnoreCase("Taipei and environs")
        || countryName.equalsIgnoreCase("Taiwan*")) {
      return "Taiwan";
    } else if (countryName.equalsIgnoreCase("Mainland China")) {
      return "China";
    } else if (countryName.equalsIgnoreCase("Hong Kong SAR")
        || countryName.equalsIgnoreCase("China, Hong Kong Special Administrative Region")) {
      return "Hong Kong";
    } else if (countryName.equalsIgnoreCase("Macao SAR") || countryName.equalsIgnoreCase("Macau")) {
      return "Macao";
    } else if (countryName.equalsIgnoreCase("Republic of Korea")
        || countryName.equalsIgnoreCase("Korea, South")) {
      return "South Korea";
    } else if (countryName.equalsIgnoreCase("Iran (Islamic Republic of)")
        || countryName.equalsIgnoreCase("Islamic Republic of Iran")) {
      return "Iran";
    } else if (countryName.equalsIgnoreCase("Slovak Republic")) {
      return "Slovakia";
    } else if (countryName.equalsIgnoreCase("Kyrgyz Republic")
        || countryName.equalsIgnoreCase("Kirgistan") || countryName.equalsIgnoreCase("Kyrgistan")) {
      return "Kyrgyzstan";
    } else if (countryName.equalsIgnoreCase("US")) {
      return "United States";
    } else if (countryName.equalsIgnoreCase("UK")) {
      return "United Kingdom";
    } else if (countryName.equalsIgnoreCase("Congo (Kinshasa)")
        || countryName.equalsIgnoreCase("Democratic Republic of Congo")
        || countryName.equalsIgnoreCase("DR Congo")
        || countryName.equalsIgnoreCase("Congo-Kinshasa")
        || countryName.equalsIgnoreCase("Democratic Republic of the Congo")) {
      return "Congo";
    } else if (countryName.equalsIgnoreCase("Congo (Brazzavile)")
        || countryName.equalsIgnoreCase("Congo (Brazzaville)")
        || countryName.equalsIgnoreCase("Congo-Brazzaville")
        || countryName.equalsIgnoreCase("Congo Republic")) {
      return "Republic of Congo";
    } else if (countryName.equalsIgnoreCase("Czechia")) {
      return "Czech Republic";
    } else if (countryName.equalsIgnoreCase("Côte d'Ivoire")) {
      return "Cote d'Ivoire";
    } else if (countryName.equalsIgnoreCase("Réunion")) {
      return "Reunion";
    } else if (countryName.equalsIgnoreCase("Russian Federation")
        || countryName.equalsIgnoreCase("Russian Federation, The")) {
      return "Russia";
    } else if (countryName.equalsIgnoreCase("Netherlands, The")
        || countryName.equalsIgnoreCase("The Netherlands")) {
      return "Netherlands";
    } else if (countryName.equalsIgnoreCase("Gambia, The")) {
      return "Gambia";
    } else if (countryName.equalsIgnoreCase("Bahamas, The")
        || countryName.equalsIgnoreCase("The Bahamas")) {
      return "Bahamas";
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
    } else if (countryName.equalsIgnoreCase("Burma")
        || countryName.equalsIgnoreCase("Myanmar (Burma)")) {
      return "Myanmar";
    } else if (countryName.equalsIgnoreCase("Vatican City")
        || countryName.equalsIgnoreCase("The Vatican")
        || countryName.equalsIgnoreCase("Vatican, The")
        || countryName.equalsIgnoreCase("Holy See")) {
      return "Vatican";
    } else if (countryName.equalsIgnoreCase("St Vincent and the Grenadines")
        || countryName.equalsIgnoreCase("St. Vincent and the Grenadines")
        || countryName.equalsIgnoreCase("Saint Vincent and the Grenadines")
        || countryName.equalsIgnoreCase("Saint Vincent & the Grenadines")
        || countryName.equalsIgnoreCase("Saint Vincent & Grenadines")
        || countryName.equalsIgnoreCase("St Vincent and the Grenadines")
        || countryName.equalsIgnoreCase("St Vincent & the Grenadines")
        || countryName.equalsIgnoreCase("St Vincent & Grenadines")
        || countryName.equalsIgnoreCase("St. Vincent and the Grenadines")
        || countryName.equalsIgnoreCase("St. Vincent & the Grenadines")
        || countryName.equalsIgnoreCase("Saint Vincent and Grenadines")
        || countryName.equalsIgnoreCase("St. Vincent & Grenadines")) {
      return "Saint Vincent and Grenadines";
    } else if (countryName.equalsIgnoreCase("St. Kitts and Nevis")
        || countryName.equalsIgnoreCase("St Kitts and Nevis")
        || countryName.equalsIgnoreCase("St Kitts & Nevis")
        || countryName.equalsIgnoreCase("St. Kitts & Nevis")
        || countryName.equalsIgnoreCase("Saint Kitts & Nevis")) {
      return "Saint Kitts and Nevis";
    } else if (countryName.equalsIgnoreCase("St. Pierre and Miquelon")
        || countryName.equalsIgnoreCase("St Pierre and Miquelon")
        || countryName.equalsIgnoreCase("St Pierre & Miquelon")
        || countryName.equalsIgnoreCase("St. Pierre & Miquelon")
        || countryName.equalsIgnoreCase("Saint Pierre & Miquelon")) {
      return "Saint Pierre and Miquelon";
    } else if (countryName.equalsIgnoreCase("Sao Tome & Principe")) {
      return "Sao Tome and Principe";
    } else if (countryName.equalsIgnoreCase("Bosnia & Herzegovina")) {
      return "Bosnia and Herzegovina";
    } else if (countryName.equalsIgnoreCase("Antigua & Barbuda")) {
      return "Antigua and Barbuda";
    } else if (countryName.equalsIgnoreCase("Trinidad & Tobago")) {
      return "Trinidad and Tobago";
    } else if (countryName.equalsIgnoreCase("Swiss")) {
      return "Switzerland";
    } else if (countryName.equalsIgnoreCase("Brunei Darussalam")) {
      return "Brunei";
    } else if (countryName.equalsIgnoreCase("Lao PDR") || countryName.equalsIgnoreCase("Lao")) {
      return "Laos";
    } else if (countryName.equalsIgnoreCase("Moldova Republic of")) {
      return "Moldova";
    } else if (countryName.equalsIgnoreCase("North Macedonia Republic Of")) {
      return "North Macedonia";
    } else if (countryName.equalsIgnoreCase("UAE")) {
      return "United Arab Emirates";
    }
    return countryName;
  }

  /**
   * Detect URLs and convert them to HTML Hyperlinks
   */
  private String buildHyperlinks(String input) {
    log.debug("href input: {}", input);

    Pattern p = Pattern.compile(
        "(?:(?:https?|ftp):\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!10(?:\\.\\d{1,3}){3})(?!127(?:\\.\\d{1,3}){3})(?!169\\.254(?:\\.\\d{1,3}){2})(?!192\\.168(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\x{00a1}-\\x{ffff}0-9]+-?)*[a-z\\x{00a1}-\\x{ffff}0-9]+)(?:\\.(?:[a-z\\x{00a1}-\\x{ffff}0-9]+-?)*[a-z\\x{00a1}-\\x{ffff}0-9]+)*(?:\\.(?:[a-z\\x{00a1}-\\x{ffff}]{2,})))(?::\\d{2,5})?(?:\\/[^\\s]*)?");
    Matcher m = p.matcher(input);
    StringBuffer sb = new StringBuffer();
    while (m.find()) {
      String orgValue = m.group();
      String newValue = String.format("<a href=\"%s\">%s</a>", orgValue, orgValue);
      m.appendReplacement(sb, newValue);
    }
    m.appendTail(sb);

    String output = sb.toString();

    log.debug("href ouput: {}", output);

    return output;
  }

  private void svgToPng() throws Exception {
    // Step -1: We read the input SVG document into Transcoder Input
    // We use Java NIO for this purpose
    String svg_URI_input = Paths.get("chessboard.svg").toUri().toURL().toString();
    TranscoderInput input_svg_image = new TranscoderInput(svg_URI_input);
    // Step-2: Define OutputStream to PNG Image and attach to TranscoderOutput
    OutputStream png_ostream = new FileOutputStream("chessboard.png");
    TranscoderOutput output_png_image = new TranscoderOutput(png_ostream);
    // Step-3: Create PNGTranscoder and define hints if required
    PNGTranscoder my_converter = new PNGTranscoder();
    // Step-4: Convert and Write output
    my_converter.transcode(input_svg_image, output_png_image);
    // Step 5- close / flush Output Stream
    png_ostream.flush();
    png_ostream.close();
  }

  private void svgToPng2() throws IOException {
    BufferedImage input_image = null;
    input_image = ImageIO.read(new File("Convert_to_PNG.svg")); // read svginto input_image object
    File outputfile = new File("imageio_png_output.png"); // create new outputfile object
    ImageIO.write(input_image, "PNG", outputfile);
  }

  // private BufferedImage svgToPng3(String svg) {
  // Reader reader = new BufferedReader(new StringReader(svg));
  // TranscoderInput svgImage = new TranscoderInput(reader);
  //
  // BufferedImageTranscoder transcoder = new BufferedImageTranscoder();
  // transcoder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, (float) component.getWidth());
  // transcoder.addTranscodingHint(PNGTranscoder.KEY_HEIGHT, (float) component.getHeight());
  // transcoder.transcode(svgImage, null);
  //
  // return transcoder.getImage();
  // }

}
