package com.covid19.rest.error;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

  @ResponseStatus(BAD_REQUEST)
  @ExceptionHandler(value = {IllegalArgumentException.class, IllegalStateException.class})
  protected ResponseEntity<Object> handleBadRequest(RuntimeException ex, WebRequest request)
      throws Exception {
    return super.handleException(ex, request);
    // return handleExceptionInternal(ex, "Invalid request or server error", new HttpHeaders(),
    // BAD_REQUEST, request);
  }

  @ResponseStatus(NOT_FOUND)
  @ExceptionHandler(value = {NotFoundException.class})
  protected ResponseEntity<Object> handleNotFoundError(RuntimeException ex, WebRequest request)
      throws Exception {
    return super.handleException(ex, request);
  }

  @ResponseStatus(INTERNAL_SERVER_ERROR)
  @ExceptionHandler(value = {InternalServerErrorException.class})
  protected ResponseEntity<Object> handleInternalServerError(RuntimeException ex,
      WebRequest request) throws Exception {
    return super.handleException(ex, request);
  }

}
