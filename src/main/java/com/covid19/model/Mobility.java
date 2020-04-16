package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import org.apache.commons.collections4.MultiValuedMap;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.opencsv.bean.CsvBindAndJoinByName;
import com.opencsv.bean.CsvBindByName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@ApiModel(description = "Apple Mobility")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class Mobility extends AbstractModel {

  @ApiModelProperty(name = "geoType", value = "Geo Type", required = false)
  @JsonProperty("geoType")
  @JsonAlias("geoType")
  @Field(name = "geoType", type = Keyword)
  @CsvBindByName(column = "geo_type", required = false)
  private String geoType;

  @ApiModelProperty(name = "country", value = "Country", required = false)
  @JsonProperty("country")
  @JsonAlias("country")
  @Field(name = "country", type = Keyword)
  @CsvBindByName(column = "region", required = false)
  private String country;

  @ApiModelProperty(name = "transportType", value = "Transportation Type", required = false)
  @JsonProperty("transportType")
  @JsonAlias("transportType")
  @Field(name = "transportType", type = Keyword)
  @CsvBindByName(column = "transportation_type", required = false)
  private String transportType;

  @ApiModelProperty(name = "dateValues", value = "Date Values", required = false)
  @JsonProperty("dateValues")
  @JsonAlias("dateValues")
  // @Field(name = "dateValues", type = Keyword)
  @CsvBindAndJoinByName(column = ".*", elementType = Double.class)
  private MultiValuedMap<String, Double> dateValues;

}
