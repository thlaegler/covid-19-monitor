package com.covid19.graphql;

import org.springframework.stereotype.Service;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;
import io.leangen.graphql.annotations.GraphQLMutation;

/**
 * Mutation Dummy
 */
@Service
public class Mutation implements GraphQLMutationResolver {

  @GraphQLMutation
  public String test() {
    return "test";
  }

}
