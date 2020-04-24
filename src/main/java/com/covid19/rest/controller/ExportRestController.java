package com.covid19.rest.controller;

import static org.springframework.http.ResponseEntity.created;
import java.net.URI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.covid19.service.ExportService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.AllArgsConstructor;

@Api(value = "Data Export API", tags = "Data Export")
@RestController
@RequestMapping(value = "/api/v1/export")
@AllArgsConstructor(onConstructor_ = {@Autowired})
public class ExportRestController {

  private final ExportService service;

  @ApiOperation(value = "Export Country Data")
  @PostMapping(value = "/countries")
  public ResponseEntity<?> exportCountryData() {
    return created(URI.create("http://www.example.org")).body(service.exportCountries());
  }

  // @ApiOperation(value = "Export covid-19-monitor data to CSV by country")
  // @GetMapping(value = "/covid-19/by_country")
  // public ResponseEntity<?> exportCovid19DataByCountry() {
  // return created(URI.create("http://www.example.org"))
  // .body(service.exportAllCovid19SnapshotsByCountry());
  // }
  //
  // @ApiOperation(value = "Export covid-19-monitor data to CSV by date")
  // @GetMapping(value = "/covid-19/by_date")
  // public ResponseEntity<?> exportCovid19DataByDate() {
  // return created(URI.create("http://www.example.org"))
  // .body(service.exportAllCovid19SnapshotsByDate());
  // }

  @ApiOperation(value = "Export COVID-19 Data")
  @PostMapping(value = "/covid19")
  public ResponseEntity<?> importCovid19() {
    service.exportAllAsync();

    return created(URI.create("http://www.example.org")).body("Started async Export");
  }

}
