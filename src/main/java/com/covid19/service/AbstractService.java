package com.covid19.service;

import static com.mobility23.api.util.FieldName.DISTANCE;
import static com.mobility23.api.util.FieldName.LOCATION;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.elasticsearch.common.geo.GeoDistance.PLANE;
import static org.elasticsearch.index.query.QueryBuilders.boolQuery;
import static org.elasticsearch.index.query.QueryBuilders.geoDistanceQuery;
import static org.elasticsearch.index.query.QueryBuilders.termQuery;
import static org.elasticsearch.index.query.QueryBuilders.termsQuery;
import static org.elasticsearch.script.ScriptType.INLINE;
import static org.elasticsearch.search.sort.SortOrder.ASC;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.ParameterizedType;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import javax.validation.constraints.NotNull;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.GeoDistanceQueryBuilder;
import org.elasticsearch.script.Script;
import org.elasticsearch.search.sort.SortBuilders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.FetchSourceFilterBuilder;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.core.query.ScriptField;
import com.covid19.model.AbstractModel;
import com.covid19.model.AbstractRequest;
import com.covid19.repo.AbstractEsRepo;
import com.covid19.rest.error.BadRequestException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class AbstractService<M extends AbstractModel> {

  protected static final int PAGE_SIZE_LIMIT = 9999;

  @Autowired
  protected ElasticsearchOperations elasticsearchOperations;

  protected abstract AbstractEsRepo<M> repo();

  public M create(M entity) {
    entity.getId();
    entity = repo().save(entity);
    return entity;
  }

  public Iterable<M> create(Iterable<M> entities) {
    entities.forEach(e -> e.getId());
    entities = repo().saveAll(entities);
    return entities;
  }

  public M update(@NotNull M entity) {
    entity.getId();
    entity = repo().save(entity);
    return entity;
  }

  public void delete(@NotNull M entity) {
    repo().delete(entity);
  }

  public void deleteById(@NotNull String id) {
    repo().deleteById(id);
  }

  public M getById(@NotNull String id) {
    M result = repo().findById(id).orElse(null);
    return result;
  }

  public Iterable<M> find(AbstractRequest request) {
    Iterable<M> results = null;

    if (request != null) {
      NativeSearchQueryBuilder query = buildQuery(request);
      log.debug("Executing Elasticsearch Query on Index '{}': {}", indexName(), query.toString());
      SearchHits<M> hits =
          elasticsearchOperations.search(query.build(), clazz(), IndexCoordinates.of(indexName()));
      results = hits.getSearchHits().stream().map(h -> {
        return h.getContent();
      }).collect(toList());
    } else {
      results = repo().findAll(PageRequest.of(0, PAGE_SIZE_LIMIT, Direction.DESC, "id"));
    }

    return results;
  }

  protected BoolQueryBuilder buildBoolQuery(AbstractRequest request) {
    BoolQueryBuilder boolQuery = boolQuery();

    if (!isBlank(request.getId())) {
      String queryTerm = request.getId();
      if (queryTerm.contains(",")) {
        boolQuery.filter(termsQuery("id", queryTerm.split(",")));
      } else {
        boolQuery.filter(termQuery("id", queryTerm));
      }
    }

    // if (request.getProvider_id() != null) {
    // boolQuery.must(matchQuery(PROVIDER_ID, request.getProvider_id()));
    // }
    //
    // if (request.getArea_id() != null) {
    // boolQuery.must(matchQuery("area_id", request.getArea_id()));
    // }
    //
    // if (request.getActive() != null) {
    // boolQuery.must(matchQuery("active", request.getActive()));
    // }

    // query: {
    // bool: {
    // must: [{
    // range: {
    // 'trip.calendar.start_date': {
    // lte: dateFormatted,
    // format: 'basic_date',
    // },
    // },
    // }, {
    // range: {
    // 'trip.calendar.end_date': {
    // gte: dateFormatted,
    // format: 'basic_date',
    // },
    // },
    // }],
    // },
    // },

    if (request.getLat() != null && request.getLng() != null) {
      GeoDistanceQueryBuilder geoQuery =
          geoDistanceQuery(LOCATION).point(request.getLat(), request.getLng()).geoDistance(PLANE)
              .distance((request.getRadius() != null ? request.getRadius() : 5000) / 1000 + "km");
      // .distance("10km");
      boolQuery.must(geoQuery);
      boolQuery.filter(geoQuery);
    }

    return boolQuery;
  }

  protected NativeSearchQueryBuilder buildQuery(AbstractRequest request) {
    NativeSearchQueryBuilder searchQueryBuilder =
        new NativeSearchQueryBuilder().withQuery(buildBoolQuery(request));

    if (request.getLat() != null && request.getLng() != null) {
      Map<String, Object> params = new HashMap<>();
      params.put("lat", request.getLat());
      params.put("lon", request.getLng());
      searchQueryBuilder.withScriptField(new ScriptField(DISTANCE, new Script(INLINE, "painless",
          "doc['" + LOCATION + "'].arcDistance(params.lat,params.lon)", params)));
      searchQueryBuilder
          .withSourceFilter(
              new FetchSourceFilterBuilder().withIncludes("*").withExcludes("").build())
          .withFields("*");

      searchQueryBuilder.withSort(//
          // SortBuilders.scriptSort(
          // new Script(INLINE, "painless",
          // "doc['" + LOCATION + "'].arcDistance(params.lat,params.lon)", params),
          // ScriptSortType.NUMBER).order(ASC)//
          SortBuilders.geoDistanceSort(LOCATION, request.getLat(), request.getLng()).order(ASC)//
      );
    }

    int page = 0;
    int size = PAGE_SIZE_LIMIT;
    Sort.Direction orderDirection = Sort.Direction.DESC;
    if (request.getPage() != null) {
      page = request.getPage();
    }
    if (request.getLimit() != null) {
      size = request.getLimit();
    }
    if (request.getOrderDirection() != null) {
      orderDirection = request.getOrderDirection();
    }
    if (request.getOrderBy() != null) {
      searchQueryBuilder
          .withPageable(PageRequest.of(page, size, orderDirection, request.getOrderBy()));
    } else {
      searchQueryBuilder.withPageable(PageRequest.of(page, size));
    }

    return searchQueryBuilder;
  }

  protected String encodeValue(String value) {
    if (value != null) {
      try {
        return URLEncoder.encode(value, UTF_8.toString());
      } catch (UnsupportedEncodingException ex) {
        throw new RuntimeException(ex.getCause());
      }
    } else {
      throw new BadRequestException("Cannot calculate route");
    }
  }

  protected String indexName() {
    return clazz().getAnnotation(Document.class).indexName();
  }

  protected Class<M> clazz() {
    return (Class<M>) ((ParameterizedType) getClass().getGenericSuperclass())
        .getActualTypeArguments()[0];
  }

}
