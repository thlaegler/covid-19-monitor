package com.covid19.rest.error;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;

@ApiModel(value = "BadRequestError")
@ResponseStatus(code = BAD_REQUEST)
@AllArgsConstructor
public class BadRequestException extends RuntimeException {

  private static final long serialVersionUID = -2259706786977248767L;

  public BadRequestException(String string) {
    super(string);
  }

  public BadRequestException(String string, Throwable cause) {
    super(string, cause);
  }

}
