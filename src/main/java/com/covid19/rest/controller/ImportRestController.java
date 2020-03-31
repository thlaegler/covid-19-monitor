package com.covid19.rest.controller;

import static org.springframework.http.ResponseEntity.created;
import java.net.URI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.covid19.service.ImportService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.AllArgsConstructor;

@Api(value = "Data Import API", tags = "Data Import")
@RestController
@RequestMapping(value = "/api/v1/import")
@AllArgsConstructor(onConstructor_ = {@Autowired})
public class ImportRestController {

  private final ImportService service;

  @ApiOperation(value = "Import Countries from CSV")
  @PostMapping(value = "/countries")
  public ResponseEntity<?> countryDetailsAll() {
    return created(URI.create("http://www.example.org")).body(service.importCountries());
  }

  @ApiOperation(
      value = "Import covid-19-monitor raw data from 'https://github.com/CSSEGISandData/covid-19-monitor/tree/master/csse_covid_19_data/csse_covid_19_daily_reports' and persist as \"Country-Date-Snapshot\"")
  @PostMapping(value = "/covid-19/{importStartDate}")
  public ResponseEntity<?> importAll(@ApiParam(example = "2020-03-20") @RequestParam(
      value = "importStartDate", required = false) String importStartDate) {
    return created(URI.create("http://www.example.org"))
        .body(service.importAllDailyReports(importStartDate));
  }


}
