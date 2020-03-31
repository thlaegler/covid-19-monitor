package com.covid19.rest;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.util.StreamUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class OutboundRequestInterceptor implements ClientHttpRequestInterceptor {

  @Override
  public ClientHttpResponse intercept(HttpRequest request, byte[] body,
      ClientHttpRequestExecution execution) throws IOException {
    log.info("RestTemplate Request: URI={}, Headers={}, Body={}", request.getURI(),
        request.getHeaders(), new String(body));

    ClientHttpResponse response =
        new BufferingClientHttpResponseWrapper(execution.execute(request, body));

    StringBuilder inputStringBuilder = new StringBuilder();
    BufferedReader bufferedReader =
        new BufferedReader(new InputStreamReader(response.getBody(), "UTF-8"));
    String line = bufferedReader.readLine();
    while (line != null) {
      inputStringBuilder.append(line);
      inputStringBuilder.append('\n');
      line = bufferedReader.readLine();
    }

    log.info("RestTemplate Response: StatusCode={} {}, Headers={}, Body={}",
        response.getStatusCode(), response.getStatusText(), response.getHeaders(),
        inputStringBuilder.toString());

    return response;
  }

  private static class BufferingClientHttpResponseWrapper implements ClientHttpResponse {

    private final ClientHttpResponse response;

    private byte[] body;


    BufferingClientHttpResponseWrapper(ClientHttpResponse response) {
      this.response = response;
    }


    @Override
    public HttpStatus getStatusCode() throws IOException {
      return this.response.getStatusCode();
    }

    @Override
    public int getRawStatusCode() throws IOException {
      return this.response.getRawStatusCode();
    }

    @Override
    public String getStatusText() throws IOException {
      return this.response.getStatusText();
    }

    @Override
    public HttpHeaders getHeaders() {
      return this.response.getHeaders();
    }

    @Override
    public InputStream getBody() throws IOException {
      if (this.body == null) {
        this.body = StreamUtils.copyToByteArray(this.response.getBody());
      }
      return new ByteArrayInputStream(this.body);
    }

    @Override
    public void close() {
      this.response.close();
    }

  }

}
