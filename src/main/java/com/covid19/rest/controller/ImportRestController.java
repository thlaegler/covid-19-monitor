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
  public ResponseEntity<?> importCountries() {
    return created(URI.create("http://www.example.org")).body(service.importCountries());
  }

  @ApiOperation(value = "Import Restriction Data from Starschema")
  @PostMapping(value = "/restrictions")
  public ResponseEntity<?> importRestrictions() {
    return created(URI.create("http://www.example.org")).body(service.importRestrictions());
  }

  @ApiOperation(value = "Import Testing from OWID")
  @PostMapping(value = "/testing")
  public ResponseEntity<?> importTestCoverage() {
    return created(URI.create("http://www.example.org")).body(service.importTesting());
  }

  @ApiOperation(value = "Import Mobility Date from Apple Mobility")
  @PostMapping(value = "/mobility")
  public ResponseEntity<?> importMobility() {
    return created(URI.create("http://www.example.org")).body(service.importMobility());
  }

  @ApiOperation(value = "Import COVID-19 Data from Johns Hopkins University")
  @PostMapping(value = "/covid19/{importStartDate}")
  public ResponseEntity<?> importCovid19(@ApiParam(example = "2020-04-06") @RequestParam(
      value = "importStartDate", required = false) String importStartDate) {
    return created(URI.create("http://www.example.org"))
        .body(service.importAllDailyReports(importStartDate));
  }

}
