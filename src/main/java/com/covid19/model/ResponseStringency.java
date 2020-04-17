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
import com.opencsv.bean.CsvIgnore;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@ApiModel(description = "Oxford Response Stringency")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class ResponseStringency extends AbstractModel {

  // CountryName,CountryCode,Date,S1_School closing,S1_IsGeneral,S2_Workplace
  // closing,S2_IsGeneral,S3_Cancel public events,S3_IsGeneral,S4_Close public
  // transport,S4_IsGeneral,S5_Public information campaigns,S5_IsGeneral,S6_Restrictions on internal
  // movement,S6_IsGeneral,S7_International travel controls,S8_Fiscal measures,S9_Monetary
  // measures,S10_Emergency investment in health care,S11_Investment in Vaccines,S12_Testing
  // framework,S13_Contact
  // tracing,ConfirmedCases,ConfirmedDeaths,StringencyIndex,StringencyIndexForDisplay,

  @Field(name = "dateId", type = FieldType.Keyword)
  @CsvIgnore
  private String dateId;

  @ApiModelProperty(name = "date", value = "Date", required = true)
  @JsonProperty("date")
  @JsonAlias("date")
  @Field(name = "date", type = Keyword)
  @CsvBindByName(column = "Date", required = true)
  private String date;

  @ApiModelProperty(name = "country", value = "Country", required = true)
  @JsonProperty("country")
  @JsonAlias("country")
  @Field(name = "country", type = Keyword)
  @CsvBindByName(column = "CountryName", required = true)
  private String country;

  @ApiModelProperty(name = "stringencyIndex", value = "Oxford Government Response Stringency Index",
      required = false)
  @JsonProperty("stringencyIndex")
  @JsonAlias("stringencyIndex")
  @Field(name = "stringencyIndex", type = FieldType.Double)
  @CsvBindByName(column = "StringencyIndex", required = false)
  private double stringencyIndex;

}
