package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import static org.springframework.data.elasticsearch.annotations.FieldType.Text;
import java.time.LocalDateTime;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.GeoPointField;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvIgnore;
import com.opencsv.bean.CsvRecurse;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@ApiModel(description = "Country")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Validated
// fool spring-data-elasticsearch with default doc type "_doc"
@Document(indexName = "countries", createIndex = true, type = "_doc")
public class Country extends AbstractModel {

  @EqualsAndHashCode.Include
  @ApiModelProperty(name = "country", value = "Country", required = true)
  @JsonProperty("country")
  @JsonAlias("country")
  @Field(name = "country", type = Keyword)
  @CsvBindByName(column = "country", required = true)
  private String country;

  @ApiModelProperty(name = "countryCode", value = "ISO Country Code", required = false)
  @JsonProperty("countryCode")
  @JsonAlias("countryCode")
  @Field(name = "countryCode", type = FieldType.Keyword)
  @CsvBindByName(column = "countryCode", required = false)
  private String countryCode;

  @ApiModelProperty(name = "populationAbsolute", value = "Population absolute", required = false)
  @JsonProperty("populationAbsolute")
  @JsonAlias("populationAbsolute")
  @Field(name = "populationAbsolute", type = FieldType.Long)
  @CsvBindByName(column = "populationAbsolute", required = false)
  private Long populationAbsolute;

  @ApiModelProperty(name = "populationNetChange", value = "Population Net Change", required = false)
  @JsonProperty("populationNetChange")
  @JsonAlias("populationNetChange")
  @Field(name = "populationNetChange", type = FieldType.Integer)
  @CsvBindByName(column = "populationNetChange", required = false)
  private Integer populationNetChange;

  @ApiModelProperty(name = "populationYearlyChange", value = "Population Yearly Change in %",
      required = false)
  @JsonProperty("populationYearlyChange")
  @JsonAlias("populationYearlyChange")
  @Field(name = "populationYearlyChange", type = FieldType.Double)
  @CsvBindByName(column = "populationYearlyChange", required = false)
  private Double populationYearlyChange;

  @ApiModelProperty(name = "populationDensity", value = "Population Density in P/Km²",
      required = false)
  @JsonProperty("populationDensity")
  @JsonAlias("populationDensity")
  @Field(name = "populationDensity", type = FieldType.Integer)
  @CsvBindByName(column = "populationDensity", required = false)
  private Integer populationDensity;

  @ApiModelProperty(name = "landArea", value = "Land Area in Km²", required = false)
  @JsonProperty("landArea")
  @JsonAlias("landArea")
  @Field(name = "landArea", type = FieldType.Integer)
  @CsvBindByName(column = "landArea", required = false)
  private Integer landArea;

  @ApiModelProperty(name = "migrants", value = "Migrants", required = false)
  @JsonProperty("migrants")
  @JsonAlias("migrants")
  @Field(name = "migrants", type = FieldType.Integer)
  @CsvBindByName(column = "migrants", required = false)
  private Integer migrants;

  @ApiModelProperty(name = "populationMedianAge", value = "Population Median Age", required = false)
  @JsonProperty("populationMedianAge")
  @JsonAlias("populationMedianAge")
  @Field(name = "populationMedianAge", type = FieldType.Integer)
  @CsvBindByName(column = "populationMedianAge", required = false)
  private Integer populationMedianAge;

  @ApiModelProperty(name = "fertilityRate", value = "Fertility Rate", required = false)
  @JsonProperty("fertilityRate")
  @JsonAlias("fertilityRate")
  @Field(name = "fertilityRate", type = FieldType.Double)
  @CsvBindByName(column = "fertilityRate", required = false)
  private Double fertilityRate;

  @ApiModelProperty(name = "urbanPopulationRatio", value = "Urban Population ratio in %",
      required = false)
  @JsonProperty("urbanPopulationRatio")
  @JsonAlias("urbanPopulationRatio")
  @Field(name = "urbanPopulationRatio", type = FieldType.Double)
  @CsvBindByName(column = "urbanPopulationRatio", required = false)
  private Double urbanPopulationRatio;

  @ApiModelProperty(name = "populationWorldShare", value = "World Population Share in %",
      required = false)
  @JsonProperty("populationWorldShare")
  @JsonAlias("populationWorldShare")
  @Field(name = "populationWorldShare", type = FieldType.Double)
  @CsvBindByName(column = "populationWorldShare", required = false)
  private Double populationWorldShare;

  @ApiModelProperty(name = "acuteCareBeds", value = "Acute Care Beds absolute", required = false)
  @JsonProperty("acuteCareBeds")
  @JsonAlias("acuteCareBeds")
  @Field(name = "acuteCareBeds", type = FieldType.Integer)
  @CsvBindByName(column = "acuteCareBedsAbsolute", required = false)
  private Integer acuteCareBeds;

  @ApiModelProperty(name = "acuteCareBedsPer100k", value = "Acute Care Beds per 100.000 Capita",
      required = false)
  @JsonProperty("acuteCareBedsPer100k")
  @JsonAlias("acuteCareBedsPer100k")
  @Field(name = "acuteCareBedsPer100k", type = FieldType.Double)
  @CsvBindByName(column = "acuteCareBedsPer100k", required = false)
  private Double acuteCareBedsPer100k;

  @ApiModelProperty(name = "criticalCareBeds", value = "Critical Care Beds absolute",
      required = false)
  @JsonProperty("criticalCareBeds")
  @JsonAlias("criticalCareBeds")
  @Field(name = "criticalCareBeds", type = FieldType.Integer)
  @CsvBindByName(column = "criticalCareBedsAbsolute", required = false)
  private Integer criticalCareBeds;

  @ApiModelProperty(name = "criticalBedsPerCapita", value = "Critical Care Beds per 100.000 Capita",
      required = false)
  @JsonProperty("criticalCareBedsPer100k")
  @JsonAlias("criticalCareBedsPer100k")
  @Field(name = "criticalCareBedsPer100k", type = FieldType.Double)
  @CsvBindByName(column = "criticalCareBedsPer100k", required = false)
  private Double criticalCareBedsPer100k;

  @ApiModelProperty(name = "criticalCareToAcuteCareRatio",
      value = "Critical Care Bed to Acute Care Bed Ratio", required = false)
  @JsonProperty("criticalCareToAcuteCareRatio")
  @JsonAlias("criticalCareToAcuteCareRatio")
  @Field(name = "criticalCareToAcuteCareRatio", type = FieldType.Double)
  @CsvBindByName(column = "criticalCareToAcuteCareRatio", required = false)
  private Double criticalCareToAcuteCareRatio;

  @ApiModelProperty(name = "gdpAbsolute", value = "GDP absolute in US$", required = false)
  @JsonProperty("gdpAbsolute")
  @JsonAlias("gdpAbsolute")
  @Field(name = "gdpAbsolute", type = FieldType.Long)
  @CsvBindByName(column = "gdpAbsolute", required = false)
  private Long gdpAbsolute;

  @ApiModelProperty(name = "gdpPerCapita", value = "GDP per Capita in US$", required = false)
  @JsonProperty("gdpPerCapita")
  @JsonAlias("gdpPerCapita")
  @Field(name = "gdpPerCapita", type = FieldType.Integer)
  @CsvBindByName(column = "gdpPerCapita", required = false)
  private Integer gdpPerCapita;

  @ApiModelProperty(name = "healthExpenditurePerCapita",
      value = "Health Expenditure in US$ per Capita", required = false)
  @JsonProperty("healthExpenditurePerCapita")
  @JsonAlias("healthExpenditurePerCapita")
  @Field(name = "healthExpenditurePerCapita", type = FieldType.Double)
  @CsvBindByName(column = "healthExpenditurePerCapita", required = false)
  private Double healthExpenditurePerCapita;

  @ApiModelProperty(name = "healthExpenditureOfGdp", value = "Health Expenditure in % of GDP",
      required = false)
  @JsonProperty("healthExpenditureOfGdp")
  @JsonAlias("healthExpenditureOfGdp")
  @Field(name = "healthExpenditureOfGdp", type = FieldType.Double)
  @CsvBindByName(column = "healthExpenditureOfGdp", required = false)
  private Double healthExpenditureOfGdp;

  @ApiModelProperty(name = "populationOver65", value = "Population over 65 absolute",
      required = false)
  @JsonProperty("populationOver65")
  @JsonAlias("populationOver65")
  @Field(name = "populationOver65", type = FieldType.Integer)
  @CsvBindByName(column = "populationOver65", required = false)
  private Integer populationOver65;

  @ApiModelProperty(name = "populationOver65Ratio", value = "Population over 65 ratio in %",
      required = false)
  @JsonProperty("populationOver65Ratio")
  @JsonAlias("populationOver65Ratio")
  @Field(name = "populationOver65Ratio", type = FieldType.Double)
  @CsvBindByName(column = "populationOver65Ratio", required = false)
  private Double populationOver65Ratio;

  @ApiModelProperty(name = "location", value = "Searchable Geo location", required = false)
  @JsonProperty("location")
  @JsonAlias("location")
  @GeoPointField
  @CsvRecurse
  private CustomGeoPoint location;

  @ApiModelProperty(name = "source", required = false)
  @JsonProperty("source")
  @JsonAlias("source")
  @Field(name = "source", type = Text)
  @CsvBindByName(column = "source", required = false)
  private String source;

  @ApiModelProperty(name = "importDate", value = "Import Date of this data into the system",
      required = true)
  @JsonProperty("importDate")
  @JsonAlias("importDate")
  @Field(name = "importDate", type = FieldType.Date, format = DateFormat.date_hour_minute_second)
  @CsvIgnore
  @Builder.Default
  private LocalDateTime importDate = LocalDateTime.now();

  @Override
  public String getId() {
    if (id == null) {
      id = getCountry();
    }
    return id;
  }

}
