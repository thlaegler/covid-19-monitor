package com.covid19.graphql;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.covid19.model.AbstractRequest;
import com.covid19.model.Country;
import com.covid19.service.AbstractService;
import com.covid19.service.CountryService;
import io.leangen.graphql.annotations.GraphQLArgument;
import io.leangen.graphql.annotations.GraphQLEnvironment;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.execution.ResolutionEnvironment;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;

@GraphQLApi
@Service
public class CountryResolver extends AbstractResolver<Country> {

  @Autowired
  private CountryService service;

  @Override
  protected AbstractService<Country> service() {
    return service;
  }

  @Override
  protected Class<Country> clazz() {
    return Country.class;
  }

  // @GraphQLMutation
  // public CountryDetail createCountryDetail(@GraphQLEnvironment ResolutionEnvironment env,
  // @GraphQLArgument(name = "request") CountryDetail request) {
  // return super.create(request);
  // }
  //
  // @GraphQLMutation
  // public Iterable<CountryDetail> createCountryDetails(@GraphQLEnvironment
  // ResolutionEnvironment env,
  // @GraphQLArgument(name = "request") List<CountryDetail> request) {
  // return super.creates(request);
  // }
  //
  // @GraphQLMutation
  // public String deleteCountryDetail(@GraphQLEnvironment ResolutionEnvironment env,
  // @GraphQLArgument(name = "id") String id) {
  // return super.delete(id);
  // }

  @GraphQLQuery
  public List<Country> getCountryDetails(@GraphQLEnvironment ResolutionEnvironment env,
      @GraphQLArgument(name = "request") AbstractRequest request) {
    return super.get(request);
  }

}
