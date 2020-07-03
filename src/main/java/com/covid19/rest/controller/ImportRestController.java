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

  @ApiOperation(value = "Import Countries")
  @PostMapping(value = "/countries")
  public ResponseEntity<?> importCountries() {
    return created(URI.create("http://www.example.org")).body(service.importCountries());
  }

  @ApiOperation(value = "Import Health Restriction Data from Starschema")
  @PostMapping(value = "/health_restrictions")
  public ResponseEntity<?> importHealthRestrictions() {
    return created(URI.create("http://www.example.org")).body(service.importHealthRestrictions());
  }

  @ApiOperation(value = "Import Trave Restriction Data from Starschema")
  @PostMapping(value = "/travel_restrictions")
  public ResponseEntity<?> importTravelRestrictions() {
    return created(URI.create("http://www.example.org")).body(service.importTravelRestrictions());
  }

  // @ApiOperation(value = "Import Testing from OWID")
  // @PostMapping(value = "/testing")
  // public ResponseEntity<?> importTestCoverage() {
  // return created(URI.create("http://www.example.org")).body(service.importTesting());
  // }
  //
  // @ApiOperation(value = "Import Oxford Government Response Stringency Index")
  // @PostMapping(value = "/response_stringency")
  // public ResponseEntity<?> importResponseStringency() {
  // return created(URI.create("http://www.example.org")).body(service.importResponseStringency());
  // }
  //
  @ApiOperation(value = "Import Mobility Date from Apple Mobility")
  @PostMapping(value = "/mobility")
  public ResponseEntity<?> importMobility() {
    service.importAppleMobility();
    service.importGoogleMobility();
    return created(URI.create("http://www.example.org")).body("");
  }

  @ApiOperation(value = "Import Data")
  @PostMapping(value = "/covid19/{importStartDate}")
  public ResponseEntity<?> importCovid19(@ApiParam(example = "2020-04-26") @RequestParam(
      value = "importStartDate", required = false) String importStartDate) {
    service.importAllAsync(importStartDate);

    return created(URI.create("http://www.example.org")).body("Started async Import");
  }

}
