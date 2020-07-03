package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import static org.springframework.data.elasticsearch.annotations.FieldType.Text;
import org.springframework.data.elasticsearch.annotations.Field;
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

@ApiModel(description = "Travel Restrictions")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class TravelRestriction extends AbstractModel {

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
  @CsvBindByName(column = "COUNTRY", required = false)
  private String country;

  @ApiModelProperty(name = "countryCode", value = "Country Code", required = true)
  @JsonProperty("countryCode")
  @JsonAlias("countryCode")
  @Field(name = "countryCode", type = Keyword)
  @CsvBindByName(column = "ISO3166_1", required = false)
  private String countryCode;

  @ApiModelProperty(name = "published", value = "Published Date", required = false)
  @JsonProperty("published")
  @JsonAlias("published")
  @Field(name = "published", type = Keyword)
  @CsvBindByName(column = "PUBLISHED", required = false)
  private String published;// 2020-02-12 00:00:00.000000

  @ApiModelProperty(name = "restriction", value = "Restrictions", required = false)
  @JsonProperty("restriction")
  @JsonAlias("restriction")
  @Field(name = "restriction", type = Text)
  @CsvBindByName(column = "RESTRICTION_TEXT", required = false)
  private String restriction;

  @ApiModelProperty(name = "source", value = "Quarantines", required = false)
  @JsonProperty("source")
  @JsonAlias("source")
  @Field(name = "source", type = Text)
  @CsvBindByName(column = "QUARANTINE_TEXT", required = false)
  private String quarantine;

  @ApiModelProperty(name = "sourceUrl", value = "Sources URL", required = false)
  @JsonProperty("sourceUrl")
  @JsonAlias("sourceUrl")
  @Field(name = "sourceUrl", type = Text)
  @CsvBindByName(column = "SOURCES", required = false)
  private String sourceUrl;

  @ApiModelProperty(name = "lastUpdated", value = "Last updated", required = false)
  @JsonProperty("lastUpdated")
  @JsonAlias("lastUpdated")
  @Field(name = "lastUpdated", type = Text)
  @CsvBindByName(column = "LAST_UPDATED_DATE", required = false)
  private String lastUpdated;// 2020-02-12 00:00:00.000000

}
