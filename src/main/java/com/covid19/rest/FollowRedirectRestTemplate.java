package com.covid19.rest;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class FollowRedirectRestTemplate extends RestTemplate {

  public FollowRedirectRestTemplate() {
    super();
    final CloseableHttpClient httpClient =
        HttpClientBuilder.create().setRedirectStrategy(new LaxRedirectStrategy()).build();
    HttpComponentsClientHttpRequestFactory factory =
        new HttpComponentsClientHttpRequestFactory(httpClient);
    setRequestFactory(factory);
    // setErrorHandler(errorHandler);
    // setInterceptors(getInterceptors());
  }

}
