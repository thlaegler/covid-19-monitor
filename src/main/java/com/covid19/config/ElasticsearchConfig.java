package com.covid19.config;

import java.util.ArrayList;
import java.util.Collection;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.elasticsearch.config.AbstractElasticsearchConfiguration;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchConverter;
import org.springframework.data.elasticsearch.core.convert.ElasticsearchCustomConversions;
import org.springframework.data.elasticsearch.core.convert.MappingElasticsearchConverter;
import org.springframework.data.elasticsearch.core.mapping.SimpleElasticsearchMappingContext;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import com.mobility23.api.converter.IntegerToLocalDateTimeConverter;
import com.mobility23.api.converter.LocalTimeToStringConverter;
import com.mobility23.api.converter.LongToLocalDateConverter;
import com.mobility23.api.converter.LongToLocalDateTimeConverter;
import com.mobility23.api.converter.StringToLocalTimeConverter;


@Order(1)
@Configuration
@EnableConfigurationProperties(ElasticsearchProperties.class)
@EnableElasticsearchRepositories(basePackages = "com.covid19")
public class ElasticsearchConfig extends AbstractElasticsearchConfiguration {

  private static final String PROTOCOL = "http";

  @Value("${covid19.service.elasticsearch.host:elasticsearch-master}")
  private String httpHost;

  @Value("${covid19.service.elasticsearch.port:9200}")
  private int httpPort;

  @Bean
  @Override
  public RestHighLevelClient elasticsearchClient() {
    RestClientBuilder builder = RestClient.builder(new HttpHost(httpHost, httpPort, PROTOCOL));
    return new RestHighLevelClient(builder);
  }

  @Override
  @Bean
  public ElasticsearchConverter elasticsearchEntityMapper(
      SimpleElasticsearchMappingContext elasticsearchMappingContext) {
    MappingElasticsearchConverter mappingConverter =
        new MappingElasticsearchConverter(elasticsearchMappingContext);
    mappingConverter.setConversions(elasticsearchCustomConversions());
    return mappingConverter;
  }

  @Override
  @Bean
  public ElasticsearchCustomConversions elasticsearchCustomConversions() {
    Collection<Converter<?, ?>> converters = new ArrayList<>();

    converters.add(new LongToLocalDateConverter());
    converters.add(new LongToLocalDateTimeConverter());
    converters.add(new IntegerToLocalDateTimeConverter());
    converters.add(new LocalTimeToStringConverter());
    converters.add(new StringToLocalTimeConverter());

    return new ElasticsearchCustomConversions(converters);
  }

  // @Bean
  // public ElasticsearchRestTemplate elasticsearchRestTemplate() {
  // return new ElasticsearchRestTemplate(elasticsearchClient());
  // }

}
