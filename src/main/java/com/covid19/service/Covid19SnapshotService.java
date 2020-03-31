package com.covid19.service;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.elasticsearch.index.query.QueryBuilders.termQuery;
import static org.elasticsearch.index.query.QueryBuilders.termsQuery;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.covid19.model.AbstractRequest;
import com.covid19.model.Covid19Snapshot;
import com.covid19.repo.Covid19SnapshotEsRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
public class Covid19SnapshotService extends AbstractService<Covid19Snapshot> {

  private final Covid19SnapshotEsRepo repo;

  @Override
  protected Covid19SnapshotEsRepo repo() {
    return repo;
  }

  @Override
  public Iterable<Covid19Snapshot> find(AbstractRequest request) {
    Iterable<Covid19Snapshot> results = super.find(request);

    // TODO: Add additional Data (color, radius, geojson etc.)

    return results;
  }

  @Override
  protected BoolQueryBuilder buildBoolQuery(AbstractRequest request) {
    BoolQueryBuilder boolQuery = super.buildBoolQuery(request);

    if (!isBlank(request.getDateId())) {
      String queryTerm = request.getDateId();
      if (queryTerm.contains(",")) {
        boolQuery.filter(termsQuery("dateId", queryTerm.split(",")));
      } else {
        boolQuery.filter(termQuery("dateId", queryTerm));
      }
    }

    if (!isBlank(request.getCountryRegion())) {
      String queryTerm = request.getCountryRegion();
      if (queryTerm.contains(",")) {
        boolQuery.filter(termsQuery("countryRegion", queryTerm.split(",")));
      } else {
        boolQuery.filter(termQuery("countryRegion", queryTerm));
      }
    }

    if (!isBlank(request.getProvinceState())) {
      String queryTerm = request.getProvinceState();
      if (queryTerm.contains(",")) {
        boolQuery.filter(termsQuery("provinceState", queryTerm.split(",")));
      } else {
        boolQuery.filter(termQuery("provinceState", queryTerm));
      }
    }

    return boolQuery;
  }

}
