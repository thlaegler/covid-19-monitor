package com.covid19.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import com.covid19.graphql.Mutation;
import com.covid19.graphql.Query;
import com.covid19.graphql.Subscription;
import com.coxautodev.graphql.tools.SchemaParserDictionary;
import graphql.GraphQL;
import graphql.execution.AsyncExecutionStrategy;
import graphql.execution.AsyncSerialExecutionStrategy;
import graphql.schema.GraphQLSchema;
import io.leangen.graphql.GraphQLSchemaGenerator;
import io.leangen.graphql.metadata.strategy.query.AnnotatedResolverBuilder;
import io.leangen.graphql.metadata.strategy.query.BeanResolverBuilder;
import io.leangen.graphql.metadata.strategy.query.PublicResolverBuilder;
import io.leangen.graphql.metadata.strategy.query.ResolverBuilder;
import io.leangen.graphql.metadata.strategy.value.jackson.JacksonValueMapperFactory;
import io.leangen.graphql.spqr.spring.annotations.GraphQLApi;
import io.swagger.annotations.ApiModelProperty;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Configuration
// @Import(SpqrAutoConfiguration.class)
public class GraphQlConfig {

  @Autowired
  private GraphQLSchemaGenerator graphQLSchemaGenerator;

  // @Autowired
  // private ObjectMapper objectMapper;

  // @Autowired
  // private GtfsRealtimeVehiclePositionResolver gtfsRealtimeVehiclePositionResolver;

  // @Autowired
  // private VehicleCommunicationResolver vehicleCommunicationResolver;

  @Bean
  @Primary
  public GraphQLSchema graphQLSchema() {
    log.info("Initialising graphql schema");

    ResolverBuilder scanResolverPackage = new BeanResolverBuilder("com.covid19")
        .withDescriptionMapper(method -> (method.getAnnotation(ApiModelProperty.class) == null) ? ""
            : method.getAnnotation(ApiModelProperty.class).value());
    // .withOperationInfoGenerator(new SnakeCaseOperationInfoGenerator());

    // FilteredResolverBuilder customBeanDocumentationMapper = new BeanResolverBuilder()
    // .withDescriptionMapper(method -> (method.getAnnotation(ApiModelProperty.class) == null) ? ""
    // : method.getAnnotation(ApiModelProperty.class).value());

    GraphQLSchema schema = graphQLSchemaGenerator.withBasePackages("com.covid19")
        .withResolverBuilders(new AnnotatedResolverBuilder(), new PublicResolverBuilder("gql"))//
        .withOperationsFromType(Query.class)//
        .withOperationsFromType(Mutation.class)//
        .withOperationsFromType(Subscription.class)//
        .withOperationsFromType(GraphQLApi.class)
        // .withOperationsFromSingleton(gtfsRealtimeVehiclePositionResolver,
        // GtfsRealtimeVehiclePositionResolver.class)//
        // .withOperationsFromType(GtfsRealtimeVehiclePositionResolver.class)//
        // .withOperationsFromSingleton(vehicleCommunicationResolver,
        // VehicleCommunicationResolver.class)
        // .withOperationsFromType(VehicleCommunicationResolver.class)//
        // .withTypeMappersPrepended(new AbstractTypeAdapter<OptionalInt, Integer> {
        //
        // @Override
        // public Integer convertOutput(OptionalInt original, AnnotatedType type,
        // ResolutionEnvironment resolutionEnvironment) {
        // return original.isPresent() ? original.getAsInt() : null;
        // }
        //
        // @Override
        // public OptionalInt convertInput(Integer substitute, AnnotatedType type,
        // GlobalEnvironment
        // environment, ValueMapper valueMapper) {
        // return substitute == null ? OptionalInt.empty() : OptionalInt.of(substitute);
        // })
        .withNestedResolverBuilders(scanResolverPackage) // , customBeanDocumentationMapper)
        .withValueMapperFactory(new JacksonValueMapperFactory())//
        .withScalarDeserializationStrategy(new JacksonValueMapperFactory())//
        .generate();

    // RuntimeWiring.newRuntimeWiring().scalar(ExtendedScalars.DateTime);

    return schema;
  }

  @Bean
  public GraphQL graphQL() {
    return GraphQL.newGraphQL(graphQLSchema())//
        // .instrumentation(ComplexityAnalysisInstrumentation(new JavaScriptEvaluator(), 10)) //
        // arbitrary number
        .queryExecutionStrategy(new AsyncExecutionStrategy())//
        .mutationExecutionStrategy(new AsyncSerialExecutionStrategy())//
        .build();
  }

  @Bean
  public SchemaParserDictionary schemaParserDictionary() {
    SchemaParserDictionary parser = new SchemaParserDictionary();
    // parser.add("Vehicle", Vehicle.class);
    // parser.add("LocalDate", LocalDate.class);
    // parser.add("LocalDateTime", LocalDateTime.class);
    // parser.add("LocalTimeInput", GraphQLLocalTime.class);
    // parser.add("LocalDateInput", GraphQLLocalDate.class);
    // parser.add("LocalDateTimeInput", GraphQLLocalDateTime.class);
    return parser;
  }
}
