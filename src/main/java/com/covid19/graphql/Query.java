package com.covid19.graphql;

import org.springframework.stereotype.Service;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;
import io.leangen.graphql.annotations.GraphQLQuery;

/**
 * Query Dummy
 */
@Service
public class Query implements GraphQLQueryResolver {

  @GraphQLQuery
  public String test() {
    return "test";
  }

}
