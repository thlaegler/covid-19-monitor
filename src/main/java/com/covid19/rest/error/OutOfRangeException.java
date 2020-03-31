package com.covid19.rest.error;

import static org.springframework.http.HttpStatus.I_AM_A_TEAPOT;
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;

@ApiModel(value = "OutOfRangeError")
@ResponseStatus(value = I_AM_A_TEAPOT)
@AllArgsConstructor
public class OutOfRangeException extends RuntimeException {

  private static final long serialVersionUID = 5971118140424852987L;

  public OutOfRangeException(String string) {
    super(string);
  }

  public OutOfRangeException(String string, Throwable cause) {
    super(string, cause);
  }

}
