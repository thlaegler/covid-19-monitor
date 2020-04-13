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
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@ApiModel(description = "OWID Testing Coverage")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class OwidTesting extends AbstractModel {

  @ApiModelProperty(name = "country", value = "Country/Entity", required = false)
  @JsonProperty("country")
  @JsonAlias("country")
  @Field(name = "country", type = Keyword)
  @CsvBindByName(column = "Entity", required = false)
  private String country;

  @ApiModelProperty(name = "dateId", value = "Date ID", required = false)
  @JsonProperty("dateId")
  @JsonAlias("dateId")
  @Field(name = "dateId", type = Keyword)
  @CsvBindByName(column = "Date", required = false)
  private String dateId;

  @ApiModelProperty(name = "source", value = "Source", required = false)
  @JsonProperty("source")
  @JsonAlias("source")
  @Field(name = "source", type = Text)
  @CsvBindByName(column = "Source label", required = false)
  private String source;

  @ApiModelProperty(name = "sourceUrl", value = "Source URL", required = false)
  @JsonProperty("sourceUrl")
  @JsonAlias("sourceUrl")
  @Field(name = "sourceUrl", type = Text)
  @CsvBindByName(column = "Source URL", required = false)
  private String sourceUrl;

  @ApiModelProperty(name = "total", value = "Cumulative total", required = false)
  @JsonProperty("total")
  @JsonAlias("total")
  @Field(name = "total", type = FieldType.Long)
  @CsvBindByName(column = "Cumulative total", required = false)
  private long total;

  @ApiModelProperty(name = "delta", value = "Daily change in cumulative total", required = false)
  @JsonProperty("delta")
  @JsonAlias("delta")
  @Field(name = "delta", type = FieldType.Long)
  @CsvBindByName(column = "Daily change in cumulative total", required = false)
  private double delta;

  @ApiModelProperty(name = "per1k", value = "Cumulative total per thousand", required = false)
  @JsonProperty("per1k")
  @JsonAlias("per1k")
  @Field(name = "per1k", type = FieldType.Double)
  @CsvBindByName(column = "Cumulative total per thousand", required = false)
  private double per1k;

}
