package com.covid19.service;

import static java.util.stream.Collectors.toList;
import java.io.IOException;
import java.util.List;
import java.util.stream.StreamSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.covid19.model.Country;
import com.covid19.model.Covid19Snapshot;
import com.covid19.repo.CountryEsRepo;
import com.covid19.repo.Covid19SnapshotEsRepo;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
public class ExportService extends CsvService {

  private final static String EXPORT_COUNTRIES_PATH = "data/countries.csv";
  private final static String EXPORT_BY_DATE_PATH = "data/by_date/%s.csv";
  private final static String EXPORT_BY_COUNTRY_PATH = "data/by_country/%s.csv";

  private final Covid19SnapshotEsRepo covid19SnapshotRepo;

  private final CountryEsRepo countryRepo;

  public boolean exportCountries() {
    List<Country> countries =
        StreamSupport.stream(countryRepo.findAll().spliterator(), false).collect(toList());

    try {
      writeCsv(EXPORT_COUNTRIES_PATH, countries, Country.class, false);
    } catch (CsvDataTypeMismatchException | CsvRequiredFieldEmptyException | IOException ex) {
      log.error("Cannot write CSV {}", EXPORT_COUNTRIES_PATH, ex);
    }

    log.info("Finished Country data export ({} countries)", countries);

    return true;
  }

  public boolean exportAllCovid19SnapshotsByCountry() {
    StreamSupport.stream(countryRepo.findAll().spliterator(), false)
        .forEach(country -> exportCovid19SnapshotsByCountry(country.getCountry()));

    log.info("Finished covid-19-monitor data export by country");

    return true;
  }

  public boolean exportAllCovid19SnapshotsByDate() {
    StreamSupport.stream(covid19SnapshotRepo.findByCountry("China").spliterator(), false)
        .forEach(snap -> exportCovid19SnapshotsByDateId(snap.getDateId()));

    log.info("Finished covid-19-monitor data export by date");

    return true;
  }

  public boolean exportCovid19SnapshotsByCountry(String country) {
    log.info("Exporting {}", country);

    List<Covid19Snapshot> snaps =
        StreamSupport.stream(covid19SnapshotRepo.findByCountry(country).spliterator(), false)
            .sorted((a, b) -> a.getDayId() - b.getDayId()).collect(toList());

    String csvFilePath = String.format(EXPORT_BY_COUNTRY_PATH, country);
    try {
      writeCsv(csvFilePath, snaps, Covid19Snapshot.class, false);
    } catch (CsvDataTypeMismatchException | CsvRequiredFieldEmptyException | IOException ex) {
      log.error("Cannot write CSV {}", csvFilePath, ex);
    }

    log.info("Finished data export for {} with {} Snapshots", country, snaps.size());

    return true;
  }

  public boolean exportCovid19SnapshotsByDateId(String dateId) {
    log.info("Exporting {}", dateId);

    List<Covid19Snapshot> snaps =
        StreamSupport.stream(covid19SnapshotRepo.findByDateId(dateId).spliterator(), false)
            .sorted((a, b) -> a.getCountry().compareToIgnoreCase(b.getCountry())).collect(toList());

    String csvFilePath = String.format(EXPORT_BY_DATE_PATH, dateId);
    try {
      writeCsv(csvFilePath, snaps, Covid19Snapshot.class, false);
    } catch (CsvDataTypeMismatchException | CsvRequiredFieldEmptyException | IOException ex) {
      log.error("Cannot write CSV {}", csvFilePath, ex);
    }

    log.info("Finished data export for {} with {} Snapshots", dateId, snaps.size());

    return true;
  }

}
