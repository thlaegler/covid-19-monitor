package com.covid19.service;

import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.elasticsearch.index.query.QueryBuilders.termQuery;
import static org.elasticsearch.index.query.QueryBuilders.termsQuery;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.stereotype.Service;
import com.covid19.model.AbstractRequest;
import com.covid19.model.Country;
import com.covid19.repo.CountryEsRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
public class CountryService extends AbstractService<Country> {

  private final CountryEsRepo repo;

  @Override
  protected CountryEsRepo repo() {
    return repo;
  }

  @Override
  protected NativeSearchQueryBuilder buildQuery(AbstractRequest request) {
    NativeSearchQueryBuilder searchQueryBuilder =
        new NativeSearchQueryBuilder().withQuery(buildBoolQuery(request));

    searchQueryBuilder.withPageable(PageRequest.of(0, PAGE_SIZE_LIMIT));

    return searchQueryBuilder;
  }

  @Override
  protected BoolQueryBuilder buildBoolQuery(AbstractRequest request) {
    BoolQueryBuilder boolQuery = super.buildBoolQuery(request);

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
