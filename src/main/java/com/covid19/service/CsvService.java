package com.covid19.service;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.springframework.util.CollectionUtils.isEmpty;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;
import javax.validation.constraints.NotEmpty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import com.covid19.util.csv.HeaderAnnotationMappingStrategy;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.ICSVParser;
import com.opencsv.ICSVWriter;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import com.opencsv.exceptions.CsvValidationException;
import com.opencsv.validators.LineValidator;
import com.opencsv.validators.RowValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
abstract public class CsvService {

  protected <R> Stream<R> readCsv(String csvFilePath, Class<R> clazz) {
    File file = new File(csvFilePath);
    if (file.exists() && file.isFile() && file.canRead() && file.length() > 10) {
      URI filePathUri = file.toURI();

      Reader fileReader;
      try {
        fileReader = Files.newBufferedReader(Paths.get(filePathUri));
      } catch (NoSuchFileException ex) {
        log.error("Cannot read CSV file {}", filePathUri);
        return Stream.empty();
      } catch (IOException e) {
        log.error("Cannot read CSV file {}", filePathUri);
        return Stream.empty();
      }
      CSVParser parser = new CSVParserBuilder() // .withQuoteChar('"')
          .withSeparator(',')//
          .withIgnoreLeadingWhiteSpace(true)//
          .withStrictQuotes(false)//
          .withIgnoreQuotations(false)//
          .build();

      CSVReader csvReader = new CSVReaderBuilder(fileReader).withSkipLines(0)
          .withVerifyReader(false).withCSVParser(parser).withRowValidator(new RowValidator() {

            @Override
            public boolean isValid(String[] row) {
              return row != null && !isBlank(row.toString().trim());
            }

            @Override
            public void validate(String[] row) throws CsvValidationException {
              if (row == null || isBlank(row.toString().trim())) {
                log.info("Blank line in CSV file {}", csvFilePath);
                // throw new CsvValidationException("blank line");
              }

            }
          }).withLineValidator(new LineValidator() {

            @Override
            public boolean isValid(String line) {
              return line != null && !isBlank(line.trim());
            }

            @Override
            public void validate(String line) throws CsvValidationException {
              if (line == null || isBlank(line.trim())) {
                log.info("Blank line in CSV file {}", csvFilePath);
                // throw new CsvValidationException("blank line");
              }
            }
          }).build();

      HeaderAnnotationMappingStrategy<R> mappingStrategy = new HeaderAnnotationMappingStrategy<R>();
      mappingStrategy.setType(clazz);

      CsvToBean<R> cb = new CsvToBeanBuilder<R>(csvReader)//
          .withType(clazz)//
          .withMappingStrategy(mappingStrategy)//
          .build();

      Stream<R> results = cb.stream();

      try {
        fileReader.close();
        csvReader.close();
      } catch (IOException e) {
        log.error("Cannot read CSV file {}", filePathUri);
        return Stream.empty();
      }

      log.debug("Converted CSV file {} to Object/JSON", filePathUri);

      return results;
    } else {
      log.debug("File not existing or empty {}", csvFilePath);
    }
    return Stream.empty();
  }

  protected <R> void writeCsv(@NonNull String csvFilePath, @NotEmpty List<R> content,
      @NonNull Class<R> clazz, boolean append)
      throws CsvDataTypeMismatchException, CsvRequiredFieldEmptyException, IOException {

    if (!isEmpty(content)) {
      if (!append) {
        createFile(csvFilePath);
      }
      try (Writer fileWriter = new FileWriter(csvFilePath, append)) {

        ICSVWriter csvWriter = new CSVWriterBuilder(fileWriter)//
            .withQuoteChar(ICSVParser.NULL_CHARACTER)//
            .build();

        HeaderAnnotationMappingStrategy<R> mappingStrategy =
            new HeaderAnnotationMappingStrategy<R>(append);
        mappingStrategy.setType(clazz);

        StatefulBeanToCsv<R> beanToCsv = new StatefulBeanToCsvBuilder<R>(csvWriter)//
            .withThrowExceptions(true)//
            .withMappingStrategy(mappingStrategy).build();

        beanToCsv.write(content);
      } catch (IOException ex) {
        log.error("Cannot write to file {}", csvFilePath, ex);
      }
    } else {
      log.debug("Skipping export of {} because no data", clazz.getSimpleName());
    }
  }

  protected File createFile(String filePath) {
    File file = new File(filePath);
    try {
      if (file.getParentFile() != null && !file.getParentFile().exists())
        file.getParentFile().mkdirs();
      if (!file.exists())
        file.createNewFile();
      if (!file.canWrite()) {
        throw new IOException("File not writable");
      }
    } catch (IOException ex) {
      log.error("Cannot write to file {}", filePath);
    }
    return file;

  }

}
