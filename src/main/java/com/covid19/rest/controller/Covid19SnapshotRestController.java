package com.covid19.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.covid19.model.Covid19Snapshot;
import com.covid19.service.Covid19SnapshotService;
import io.swagger.annotations.Api;
import lombok.AllArgsConstructor;

@Api(value = "covid-19-monitor Country-Date-Snapshots API", tags = "covid-19-monitor Snapshots")
@RestController
@RequestMapping(value = "/api/v1/covid19")
@AllArgsConstructor(onConstructor_ = {@Autowired})
public class Covid19SnapshotRestController extends AbstractRestController<Covid19Snapshot> {

  private final Covid19SnapshotService service;

  @Override
  protected Covid19SnapshotService service() {
    return service;
  }

}
