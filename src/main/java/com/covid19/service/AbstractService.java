package com.covid19.service;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.elasticsearch.index.query.QueryBuilders.boolQuery;
import static org.elasticsearch.index.query.QueryBuilders.termQuery;
import static org.elasticsearch.index.query.QueryBuilders.termsQuery;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.ParameterizedType;
import java.net.URLEncoder;
import javax.validation.constraints.NotNull;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import com.covid19.model.AbstractModel;
import com.covid19.model.AbstractRequest;
import com.covid19.repo.AbstractEsRepo;
import com.mobility23.rest.error.BadRequestException;
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

    return boolQuery;
  }

  protected NativeSearchQueryBuilder buildQuery(AbstractRequest request) {
    NativeSearchQueryBuilder searchQueryBuilder =
        new NativeSearchQueryBuilder().withQuery(buildBoolQuery(request));

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
