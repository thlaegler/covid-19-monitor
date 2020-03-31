package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.collections4.MultiValuedMap;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.opencsv.bean.CsvBindAndJoinByName;
import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvIgnore;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Validated
public class AbstractTimeseries extends AbstractModel {

  @ApiModelProperty(name = "provinceState", value = "Province/State", required = false)
  @JsonProperty("provinceState")
  @JsonAlias("provinceState")
  @Field(name = "provinceState", type = Keyword)
  @CsvBindByName(column = "Province/State", required = false)
  private String provinceState;

  @ApiModelProperty(name = "countryRegion", value = "Country/Region", required = false)
  @JsonProperty("countryRegion")
  @JsonAlias("countryRegion")
  @Field(name = "countryRegion", type = Keyword)
  @CsvBindByName(column = "Country/Region", required = false)
  private String countryRegion;

  @JsonIgnore
  @CsvBindAndJoinByName(column = "[0-9]{1}.*", elementType = Integer.class)
  private MultiValuedMap<String, Integer> rawTimeseries;

  @ApiModelProperty(name = "timeseries", value = "Timeseries Data", required = true)
  @JsonProperty("timeseries")
  @JsonAlias("timeseries")
  @Field(name = "timeseries", type = FieldType.Auto)
  @CsvIgnore
  @Builder.Default
  private Map<String, Integer> timeseries = new HashMap<>();

  @ApiModelProperty(name = "latitude", value = "Latitude", required = true)
  @JsonProperty("latitude")
  @JsonAlias("latitude")
  @Field(name = "latitude", type = FieldType.Double)
  @CsvBindByName(column = "Lat", required = true)
  private Double latitude;

  @ApiModelProperty(name = "longitude", value = "Longitude", required = true)
  @JsonProperty("longitude")
  @JsonAlias("longitude")
  @Field(name = "longitude", type = FieldType.Double)
  @CsvBindByName(column = "Long", required = true)
  private Double longitude;


  // Non CSV fields or calculated fields


  @ApiModelProperty(name = "growthRateLast24Hours", value = "Growth Rate in the last 24 Hours",
      required = true)
  @JsonProperty("growthRateLast24Hours")
  @JsonAlias("growthRateLast24Hours")
  @Field(name = "growthRateLast24Hours", type = FieldType.Double)
  @CsvIgnore
  private Double growthRateLast24Hours;

  @ApiModelProperty(name = "growthRateLast7Days", value = "Growth Rate in the last 7 Days",
      required = true)
  @JsonProperty("growthRateLast7Days")
  @JsonAlias("growthRateLast7Days")
  @Field(name = "growthRateLast7Days", type = FieldType.Double)
  @CsvIgnore
  private Double growthRateLast7Days;

}
