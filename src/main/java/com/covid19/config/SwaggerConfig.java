package com.covid19.config;

import static com.google.common.collect.Sets.newHashSet;
import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.HEAD;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;
import static springfox.documentation.builders.RequestHandlerSelectors.basePackage;
import static springfox.documentation.spi.DocumentationType.SWAGGER_2;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import javax.servlet.ServletContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.annotations.ApiIgnore;
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.ResponseMessageBuilder;
import springfox.documentation.schema.ModelRef;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.service.Parameter;
import springfox.documentation.service.ResponseMessage;
import springfox.documentation.spring.web.paths.RelativePathProvider;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger.web.SecurityConfiguration;
import springfox.documentation.swagger.web.SecurityConfigurationBuilder;
import springfox.documentation.swagger2.annotations.EnableSwagger2;


@Configuration
@EnableSwagger2
// @EnableSwagger2WebMvc
public class SwaggerConfig {

  private static final String CODE_200 = "OK";
  private static final String CODE_201 = "Created";
  private static final String CODE_204 = "No Content";
  private static final String CODE_400 = "Bad Request";
  private static final String CODE_401 = "Unauthorized";
  private static final String CODE_404 = "Not Found";
  private static final String CODE_409 = "Conflict";
  private static final String CODE_500 = "Internal Server Error";

  @Value("${spring.application.name:covid-19}")
  private String artifactId;

  @Value("${covid19.version:0.0.1}")
  private String version;

  @Value("${covid19.service.oauth2.host:spring-oauth2-service}")
  private String oauth2Host;

  @Value("${covid19.service.oauth2.port:8889}")
  private String oauth2Port;

  // @Value("${covid19.basepath}")
  private String basePath = "";

  @Bean
  public Docket swaggerApi(ServletContext servletContext) {
    // @formatter:off
    return new Docket(SWAGGER_2)
        .pathProvider(new RelativePathProvider(servletContext) {
                @Override
                public String getApplicationBasePath() {
                    return basePath + servletContext.getContextPath();
                }
            })
        .directModelSubstitute(Locale.class, String.class)
        .directModelSubstitute(LocalDateTime.class, String.class)
        .directModelSubstitute(LocalDate.class, String.class)
        .ignoredParameterTypes(ApiIgnore.class).forCodeGeneration(true)
        .protocols(protocols())
        .useDefaultResponseMessages(false)
        .globalResponseMessage(GET, asList(
            message200(), message400(), message401(), message404(), message500()))
        .globalResponseMessage(PUT, asList(
            message200(), message400(), message401(), message404(), message409(), message500()))
        .globalResponseMessage(POST, asList(
            message201(), message400(), message401(), message409(), message500()))
        .globalResponseMessage(DELETE, asList(
            message204(), message400(), message401(), message500()))
        .globalResponseMessage(HEAD, asList(
                message204(), message400(), message401(), message500()))
        .apiInfo(apiInfo())
        .select()
            .apis(basePackage("com.covid19"))
        .paths(PathSelectors.any())
        .build();
    // @formatter:on
  }

  @Bean
  public SecurityConfiguration security() {
    return SecurityConfigurationBuilder.builder()//
        .clientId("test")//
        .clientSecret("test")//
        .useBasicAuthenticationWithAccessCodeGrant(false).appName(artifactId)//
        .scopeSeparator(",")//
        .useBasicAuthenticationWithAccessCodeGrant(true)//
        .build();
  }

  @SuppressWarnings("unused")
  private List<Parameter> operationParameters() {
    Parameter localeParam = new ParameterBuilder().name("accept-language")
        .description("Language (IETF BCP 47)").required(false).modelRef(new ModelRef("string"))
        .parameterType("header").defaultValue("en-US").build();
    return asList(localeParam);
  }

  private ApiInfo apiInfo() {
    return new ApiInfo(artifactId + " REST API",
        "For more information: https://github.com/thcovid19/covid-19-monitor", version, "",
        swaggerContact(), "Proprietary licence", "http://www.example.org", emptyList());
  }

  private Contact swaggerContact() {
    return new Contact("covid-19-monitor", "http://www.example.org", "info@example.org");
  }

  private Set<String> protocols() {
    return newHashSet("http"// , "https"
    );
  }

  private ResponseMessage message200() {
    return new ResponseMessageBuilder().code(200).message(CODE_200).build();
  }

  private ResponseMessage message201() {
    return new ResponseMessageBuilder().code(201).message(CODE_201).build();
  }

  private ResponseMessage message204() {
    return new ResponseMessageBuilder().code(500).message(CODE_204).build();
  }

  private ResponseMessage message400() {
    return new ResponseMessageBuilder().code(400).message(CODE_400).build();
  }

  private ResponseMessage message401() {
    return new ResponseMessageBuilder().code(401).message(CODE_401).build();
  }

  private ResponseMessage message404() {
    return new ResponseMessageBuilder().code(404).message(CODE_404).build();
  }

  private ResponseMessage message409() {
    return new ResponseMessageBuilder().code(409).message(CODE_409).build();
  }

  private ResponseMessage message500() {
    return new ResponseMessageBuilder().code(500).message(CODE_500).build();
  }

}
