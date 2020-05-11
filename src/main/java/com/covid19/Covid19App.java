package com.covid19;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.mobility23.service.taxi.SuperShuttleTaxiService;
import com.mobility23.service.taxi.TaxiService;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@SpringBootApplication
@EnableAutoConfiguration
@EnableScheduling
@EnableCaching
@EnableConfigurationProperties
@ConfigurationPropertiesScan({"com.covid19"})
@ComponentScan(basePackages = {"com.covid19", "com.mobility23"},
    excludeFilters = @Filter(classes = {TaxiService.class, SuperShuttleTaxiService.class},
        type = FilterType.ASSIGNABLE_TYPE))
@EntityScan(basePackages = {"com.covid19.model", "com.mobility23.model"})
@EnableElasticsearchRepositories(basePackages = {"com.covid19.repo", "com.mobility23.repo"})
public class Covid19App {

  public static void main(String[] args) {
    log.info("Starting covid-19-monitor Service ... ");
    ConfigurableApplicationContext ctx = SpringApplication.run(Covid19App.class, args);
    log.info("Started covid-19-monitor ({}) ...", ctx.getId());
  }

}
