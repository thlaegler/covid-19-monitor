package com.covid19.rest.error;

import static org.springframework.http.HttpStatus.CONFLICT;
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;

@ApiModel(value = "ConflictError")
@ResponseStatus(code = CONFLICT)
@AllArgsConstructor
public class ConflictException extends RuntimeException {

  private static final long serialVersionUID = -6345203079772341196L;

  public ConflictException(String string) {
    super(string);
  }

  public ConflictException(String string, Throwable cause) {
    super(string, cause);
  }

}
