package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import static org.springframework.data.elasticsearch.annotations.FieldType.Text;
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

@ApiModel(description = "Travel Restrictions New")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class TravelRestriction2 extends AbstractModel {

  @ApiModelProperty(name = "dateId", value = "Date ID", required = false)
  @JsonProperty("dateId")
  @JsonAlias("dateId")
  @Field(name = "dateId", type = Keyword)
  @CsvIgnore
  private String dateId;

  @ApiModelProperty(name = "country", value = "Country", required = true)
  @JsonProperty("country")
  @JsonAlias("country")
  @Field(name = "country", type = Keyword)
  @CsvBindByName(column = "adm0_name", required = true)
  private String country;

  @ApiModelProperty(name = "countryCode", value = "Country Code", required = false)
  @JsonProperty("countryCode")
  @JsonAlias("countryCode")
  @Field(name = "countryCode", type = Keyword)
  @CsvBindByName(column = "iso3", required = false)
  private String countryCode;

  @ApiModelProperty(name = "lat", value = "Latitude", required = false)
  @JsonProperty("lat")
  @JsonAlias("lat")
  @Field(name = "lat", type = FieldType.Double)
  @CsvBindByName(column = "Y", required = false)
  private Double lat;

  @ApiModelProperty(name = "lon", value = "Longitude", required = false)
  @JsonProperty("lon")
  @JsonAlias("lon")
  @Field(name = "lon", type = FieldType.Double)
  @CsvBindByName(column = "X", required = false)
  private Double lon;

  @ApiModelProperty(name = "published", value = "Published Date", required = false)
  @JsonProperty("published")
  @JsonAlias("published")
  @Field(name = "published", type = Keyword)
  @CsvBindByName(column = "published", required = false)
  private String published;// 25.06.2020

  @ApiModelProperty(name = "restriction", value = "Restrictions", required = false)
  @JsonProperty("restriction")
  @JsonAlias("restriction")
  @Field(name = "restriction", type = Text)
  @CsvBindByName(column = "info", required = false)
  private String restriction;

  @ApiModelProperty(name = "quarantine", value = "Quarantines", required = false)
  @JsonProperty("quarantine")
  @JsonAlias("quarantine")
  @Field(name = "quarantine", type = Text)
  @CsvBindByName(column = "optional2", required = false)
  private String quarantine;

  @ApiModelProperty(name = "description", value = "Description", required = false)
  @JsonProperty("description")
  @JsonAlias("description")
  @Field(name = "description", type = Text)
  @CsvBindByName(column = "optional1", required = false)
  private String description;

  @ApiModelProperty(name = "certification", value = "Certification", required = false)
  @JsonProperty("certification")
  @JsonAlias("certification")
  @Field(name = "certification", type = Text)
  @CsvBindByName(column = "optional3", required = false)
  private String certification;

  @ApiModelProperty(name = "objectId", value = "Object Id", required = false)
  @JsonProperty("objectId")
  @JsonAlias("objectId")
  @Field(name = "objectId", type = FieldType.Integer)
  @CsvBindByName(column = "ObjectId", required = false)
  private Integer objectId;

  @ApiModelProperty(name = "sourceUrl", value = "Sources URL", required = false)
  @JsonProperty("sourceUrl")
  @JsonAlias("sourceUrl")
  @Field(name = "sourceUrl", type = Text)
  @CsvBindByName(column = "sources", required = false)
  private String sourceUrl;

}
