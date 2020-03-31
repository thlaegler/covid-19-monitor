package com.covid19.rest;

import static javax.servlet.http.HttpServletResponse.SC_OK;
import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

/**
 * CORS Filter for JavaScript pre-flight requests
 */
@Slf4j
@Order(1)
@Component
public class CustomCorsFilter implements Filter {

  @Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {

    HttpServletResponse response = (HttpServletResponse) res;
    HttpServletRequest request = (HttpServletRequest) req;

    String origin = request.getHeader("Origin");
    origin = origin != null ? origin : "*";
    response.setHeader("Access-Control-Allow-Origin", origin);

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
      response.setHeader("Access-Control-Max-Age", "3600");
      response.setHeader("Access-Control-Allow-Credentials", "true");
      response.setHeader("Access-Control-Allow-Headers", "*");
      response.setStatus(SC_OK);
    } else {
      chain.doFilter(req, res);
    }
  }

  @Override
  public void init(FilterConfig filterConfig) {
    // Do nothing
  }

  @Override
  public void destroy() {
    // Do nothing
  }

}
