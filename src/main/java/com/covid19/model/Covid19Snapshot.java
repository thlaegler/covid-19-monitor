package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import java.time.LocalDateTime;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.opencsv.bean.CsvBindByName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@ApiModel(description = "covid-19-monitor Snapshot of Country and Date")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Validated
// fool spring-data-elasticsearch with default doc type "_doc"
@Document(indexName = "covid19_snapshots", createIndex = true, type = "_doc")
public class Covid19Snapshot extends AbstractModel {

  @ApiModelProperty(name = "dateId", value = "Date in ISO format (YYYY-mm-dd)", required = false)
  @CsvBindByName(column = "dateId")
  @Field(type = FieldType.Keyword)
  private String dateId;

  @ApiModelProperty(name = "dayId",
      value = "Number of Days since 1th of Januaray 2020 (start of chinese/global data collection)",
      required = false)
  @CsvBindByName(column = "dayId")
  @Field(type = FieldType.Integer)
  private Integer dayId;

  @ApiModelProperty(name = "country", value = "Country or Region", required = false)
  @CsvBindByName(column = "country")
  @Field(type = FieldType.Keyword)
  private String country;

  @ApiModelProperty(name = "countryCode", value = "ISO Country Code", required = false)
  @CsvBindByName(column = "countryCode")
  @Field(type = FieldType.Keyword)
  private String countryCode;

  @ApiModelProperty(value = "Confirmed Cases")
  @CsvBindByName
  @Field(type = FieldType.Long)
  private long confirmed;

  @CsvBindByName
  @Field(type = FieldType.Long)
  private long confirmedDelta;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double confirmedGrowthRate;

  @ApiModelProperty(name = "recovered", value = "Recovered Cases")
  @CsvBindByName
  @Field(type = FieldType.Long)
  private long recovered;

  @CsvBindByName
  @Field(type = FieldType.Long)
  private long recoveredDelta;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double recoveredGrowthRate;

  @ApiModelProperty(name = "deceased", value = "Deceased Cases")
  @CsvBindByName
  @Field(type = FieldType.Long)
  private long deceased;

  @CsvBindByName
  @Field(type = FieldType.Long)
  private long deceasedDelta;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double deceasedGrowthRate;

  @ApiModelProperty(name = "infectious", value = "Active/Infectious Cases")
  @CsvBindByName
  @Field(type = FieldType.Long)
  private long infectious;

  @CsvBindByName
  @Field(type = FieldType.Long)
  private long infectiousDelta;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double infectiousGrowthRate;

  @ApiModelProperty(name = "tested", value = "Tested Cases/People")
  @CsvBindByName
  @Field(name = "tested", type = FieldType.Long)
  private long tested;

  @CsvBindByName
  @Field(type = FieldType.Long)
  private long testedDelta;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double testedPer1k;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double incidencePer100k;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double recoveryRate;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double caseFatalityRisk;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double immunizationRate;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double doublingTime;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double appleMobility;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double googleMobility;

  @CsvBindByName
  @Field(type = FieldType.Double)
  private double responseStringency;

  // @ApiModelProperty(name = "location", value = "Searchable Geo location", required = false)
  // @CsvRecurse
  // private CustomGeoPoint location;

  // @ApiModelProperty(name = "source", required = false)
  // @CsvBindByName(column = "source")
  // private String source;

  @ApiModelProperty(name = "importDate", value = "Import Date of this data into the system",
      required = true)
  @CsvBindByName(column = "importDate")
  @Builder.Default
  @Field(type = FieldType.Long)
  private LocalDateTime importDate = LocalDateTime.now();

  @Override
  public String getId() {
    if (id == null) {
      id = getCountry() + ":" + getDateId();
    }
    return id;
  }

}
