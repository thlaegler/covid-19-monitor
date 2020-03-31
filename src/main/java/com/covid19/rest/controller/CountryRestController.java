package com.covid19.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.covid19.model.Country;
import com.covid19.service.CountryService;
import io.swagger.annotations.Api;
import lombok.AllArgsConstructor;

@Api(value = "Countries API", tags = "Countries")
@RestController
@RequestMapping(value = "/api/v1/countries")
@AllArgsConstructor(onConstructor_ = {@Autowired})
public class CountryRestController extends AbstractRestController<Country> {

  private final CountryService service;

  @Override
  protected CountryService service() {
    return service;
  }

}
