package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import org.springframework.data.annotation.Id;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.opencsv.bean.CsvIgnore;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@ApiModel(description = "Abstract Model")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Validated
public abstract class AbstractModel {

  @ApiModelProperty(name = "id", value = "Unique ID of this record")
  @Id
  @EqualsAndHashCode.Include
  @CsvIgnore
  protected String id;

}
