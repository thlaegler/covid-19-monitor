package com.covid19.rest.error;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;

@ApiModel(value = "NotImplementedError")
@ResponseStatus(code = NOT_FOUND)
@AllArgsConstructor
public class NotImplementedException extends RuntimeException {

  private static final long serialVersionUID = 4368902262300974196L;

  public NotImplementedException(String string) {
    super(string);
  }

  public NotImplementedException(String string, Throwable cause) {
    super(string, cause);
  }

}
