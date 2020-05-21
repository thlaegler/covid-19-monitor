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


@ApiModel(description = "Public Health Restriction")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class HealthRestriction extends AbstractModel {

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
  @CsvBindByName(column = "COUNTRY_STATE", required = false)
  private String country;

  @ApiModelProperty(name = "category", value = "Category", required = false)
  @JsonProperty("category")
  @JsonAlias("category")
  @Field(name = "category", type = Text)
  @CsvBindByName(column = "CATEGORY", required = false)
  private String category;

  @ApiModelProperty(name = "measure", value = "Measure", required = false)
  @JsonProperty("measure")
  @JsonAlias("measure")
  @Field(name = "measure", type = Text)
  @CsvBindByName(column = "MEASURE", required = false)
  private String measure;

  @ApiModelProperty(name = "comments", value = "Comments", required = false)
  @JsonProperty("comments")
  @JsonAlias("comments")
  @Field(name = "comments", type = Text)
  @CsvBindByName(column = "COMMENTS", required = false)
  private String comments;

  @ApiModelProperty(name = "dateImplemented", value = "Date implemented", required = false)
  @JsonProperty("dateImplemented")
  @JsonAlias("dateImplemented")
  @Field(name = "dateImplemented", type = Text)
  @CsvBindByName(column = "DATE_IMPLEMENTED", required = false)
  private String dateImplemented; // 2020-02-12 00:00:00.000000

  @ApiModelProperty(name = "entryDate", value = "Date entry", required = false)
  @JsonProperty("entryDate")
  @JsonAlias("entryDate")
  @Field(name = "entryDate", type = Text)
  @CsvBindByName(column = "ENTRY_DATE", required = false)
  private String entryDate; // 2020-02-12 00:00:00.000000

  @ApiModelProperty(name = "source", value = "Source", required = false)
  @JsonProperty("source")
  @JsonAlias("source")
  @Field(name = "source", type = Text)
  @CsvBindByName(column = "SOURCE", required = false)
  private String source;

  @ApiModelProperty(name = "sourceType", value = "Source Type", required = false)
  @JsonProperty("sourceType")
  @JsonAlias("sourceType")
  @Field(name = "sourceType", type = Keyword)
  @CsvBindByName(column = "SOURCE_TYPE", required = false)
  private String sourceType;

  @ApiModelProperty(name = "sourceUrl", value = "Source URL", required = false)
  @JsonProperty("sourceUrl")
  @JsonAlias("sourceUrl")
  @Field(name = "sourceUrl", type = Text)
  @CsvBindByName(column = "LINK", required = false)
  private String sourceUrl;

  @ApiModelProperty(name = "lastUpdated", value = "Last updated", required = false)
  @JsonProperty("lastUpdated")
  @JsonAlias("lastUpdated")
  @Field(name = "lastUpdated", type = Text)
  @CsvBindByName(column = "LAST_UPDATED_DATE", required = false)
  private String lastUpdated; // 2020-04-14 00:04:10.787664
}
