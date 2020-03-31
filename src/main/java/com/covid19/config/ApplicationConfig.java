package com.covid19.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@EnableCaching
@EnableConfigurationProperties
@EnableAutoConfiguration
@EntityScan(basePackages = {"com.covid19"})
@EnableElasticsearchRepositories
@ConfigurationPropertiesScan({"com.covid19"})
public class ApplicationConfig {


}

