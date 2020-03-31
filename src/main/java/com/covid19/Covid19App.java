package com.covid19;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.elasticsearch.ElasticSearchRestHealthContributorAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import com.mobility23.api.config.ElasticsearchConfig;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@SpringBootApplication(scanBasePackages = {"com.covid19"},
    exclude = {DataSourceAutoConfiguration.class, ElasticsearchAutoConfiguration.class,
        ElasticSearchRestHealthContributorAutoConfiguration.class,
        ElasticsearchDataAutoConfiguration.class, SpringDataWebAutoConfiguration.class})
@ComponentScan(basePackages = {"com.covid19"},
    excludeFilters = @Filter(type = FilterType.ASSIGNABLE_TYPE,
        classes = {ElasticsearchConfig.class}))
public class Covid19App {

  public static void main(String[] args) {
    log.info("Starting covid-19-monitor Service ... ");
    ConfigurableApplicationContext ctx = SpringApplication.run(Covid19App.class, args);
    log.info("Started covid-19-monitor ({}) ...", ctx.getId());
  }

}
