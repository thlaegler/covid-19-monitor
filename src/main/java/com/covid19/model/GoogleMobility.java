package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.opencsv.bean.CsvBindByName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@ApiModel(description = "Google Mobility")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class GoogleMobility extends AbstractModel {

  @ApiModelProperty(name = "country", value = "Country", required = false)
  @JsonProperty("country")
  @JsonAlias("country")
  @Field(name = "country", type = Keyword)
  @CsvBindByName(column = "country_region", required = false)
  private String country;

  @ApiModelProperty(name = "date", value = "Date", required = true)
  @JsonProperty("date")
  @JsonAlias("date")
  @Field(name = "date", type = Keyword)
  @CsvBindByName(column = "date", required = true)
  private String dateId;

  @ApiModelProperty(name = "retailRecreation", value = "Retail&Recreation Change from Baseline",
      required = false)
  @JsonProperty("retailRecreation")
  @JsonAlias("retailRecreation")
  @Field(name = "retailRecreation", type = FieldType.Double)
  @CsvBindByName(column = "retail_and_recreation_percent_change_from_baseline", required = false)
  private double retailRecreation;

  @ApiModelProperty(name = "groceryPharmacy", value = "Grocery&Pharmacy Change from Baseline",
      required = false)
  @JsonProperty("groceryPharmacy")
  @JsonAlias("groceryPharmacy")
  @Field(name = "groceryPharmacy", type = FieldType.Double)
  @CsvBindByName(column = "grocery_and_pharmacy_percent_change_from_baseline", required = false)
  private double groceryPharmacy;

  @ApiModelProperty(name = "park", value = "Park Change from Baseline", required = false)
  @JsonProperty("park")
  @JsonAlias("park")
  @Field(name = "park", type = FieldType.Double)
  @CsvBindByName(column = "parks_percent_change_from_baseline", required = false)
  private double park;

  @ApiModelProperty(name = "transit", value = "Transit Change from Baseline", required = false)
  @JsonProperty("transit")
  @JsonAlias("transit")
  @Field(name = "transit", type = FieldType.Double)
  @CsvBindByName(column = "transit_stations_percent_change_from_baseline", required = false)
  private double transit;

  @ApiModelProperty(name = "workplace", value = "Workplace Change from Baseline", required = false)
  @JsonProperty("workplace")
  @JsonAlias("workplace")
  @Field(name = "workplace", type = FieldType.Double)
  @CsvBindByName(column = "workplaces_percent_change_from_baseline", required = false)
  private double workplace;

  @ApiModelProperty(name = "residential", value = "Residential Change from Baseline",
      required = false)
  @JsonProperty("residential")
  @JsonAlias("residential")
  @Field(name = "residential", type = FieldType.Double)
  @CsvBindByName(column = "residential_percent_change_from_baseline", required = false)
  private double residential;

}
