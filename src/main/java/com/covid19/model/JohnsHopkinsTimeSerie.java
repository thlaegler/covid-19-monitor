package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import java.util.Map;
import org.apache.commons.collections4.MultiValuedMap;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.opencsv.bean.CsvBindAndJoinByName;
import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvIgnore;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@ApiModel(description = "Johns Hopkins Timeseries")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class JohnsHopkinsTimeSerie extends AbstractModel {

  @ApiModelProperty(value = "Country/Region", required = true)
  @Field(type = Keyword)
  @CsvBindByName(column = "Country/Region", required = true)
  private String country;

  @ApiModelProperty(value = "Province/State", required = false)
  @JsonAlias("province_state")
  @Field(type = Keyword)
  @CsvBindByName(column = "Province/State", required = false)
  private String provinceState;

  @ApiModelProperty(value = "Latitude", required = false)
  @Field(type = FieldType.Double)
  @CsvBindByName(column = "Lat", required = false)
  private Double lat;

  @ApiModelProperty(value = "Longitude", required = false)
  @Field(type = FieldType.Double)
  @CsvBindByName(column = "Long", required = false)
  private Double lon;

  /**
   * Source Date Format: 4/25/20
   */
  @ApiModelProperty(value = "Date Values", required = false)
  @JsonAlias("date_values")
  // @Field(name = "dateValues", type = Keyword)
  @CsvBindAndJoinByName(column = ".*", elementType = Long.class)
  private MultiValuedMap<String, Long> dateValues;

  @ApiModelProperty(value = "Date ID Values", required = false)
  @JsonAlias("date_id_values")
  @CsvIgnore
  private Map<String, Long> dateIdValues;

}
