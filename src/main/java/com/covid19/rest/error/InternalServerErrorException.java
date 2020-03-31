package com.covid19.rest.error;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;

@ApiModel(value = "InternalServerError")
@ResponseStatus(code = INTERNAL_SERVER_ERROR)
@AllArgsConstructor
public class InternalServerErrorException extends RuntimeException {

  private static final long serialVersionUID = -3537995917215647359L;

  public InternalServerErrorException(String string) {
    super(string);
  }

  public InternalServerErrorException(String string, Throwable cause) {
    super(string, cause);
  }

}
