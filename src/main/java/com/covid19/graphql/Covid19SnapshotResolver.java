package com.covid19.graphql;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.covid19.model.AbstractRequest;
import com.covid19.model.Covid19Snapshot;
import com.covid19.service.AbstractService;
import com.covid19.service.Covid19SnapshotService;
import io.leangen.graphql.annotations.GraphQLArgument;
import io.leangen.graphql.annotations.GraphQLEnvironment;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.execution.ResolutionEnvironment;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;

@GraphQLApi
@Service
public class Covid19SnapshotResolver extends AbstractResolver<Covid19Snapshot> {

  @Autowired
  private Covid19SnapshotService service;

  @Override
  protected AbstractService<Covid19Snapshot> service() {
    return service;
  }

  @Override
  protected Class<Covid19Snapshot> clazz() {
    return Covid19Snapshot.class;
  }

  // @GraphQLMutation
  // public CountryDateSnapshot createCountryDateSnapshot(@GraphQLEnvironment ResolutionEnvironment
  // env,
  // @GraphQLArgument(name = "request") CountryDateSnapshot request) {
  // return super.create(request);
  // }
  //
  // @GraphQLMutation
  // public Iterable<CountryDateSnapshot> createCountryDateSnapshots(@GraphQLEnvironment
  // ResolutionEnvironment env,
  // @GraphQLArgument(name = "request") List<CountryDateSnapshot> request) {
  // return super.creates(request);
  // }
  //
  // @GraphQLMutation
  // public String deleteCountryDateSnapshot(@GraphQLEnvironment ResolutionEnvironment env,
  // @GraphQLArgument(name = "id") String id) {
  // return super.delete(id);
  // }

  @GraphQLQuery
  public List<Covid19Snapshot> getCountryDateSnapshots(
      @GraphQLEnvironment ResolutionEnvironment env,
      @GraphQLArgument(name = "request") AbstractRequest request) {
    return super.get(request);
  }

}
