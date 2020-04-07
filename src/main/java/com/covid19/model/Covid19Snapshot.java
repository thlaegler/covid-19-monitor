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
  private String dateId;

  @ApiModelProperty(name = "dayId",
      value = "Number of Days since 1th of Januaray 2020 (start of chinese/global data collection)",
      required = false)
  @CsvBindByName(column = "dayId")
  private Integer dayId;

  @ApiModelProperty(name = "country", value = "Country or Region", required = false)
  @CsvBindByName(column = "country")
  private String country;

  @ApiModelProperty(name = "countryCode", value = "ISO Country Code", required = false)
  @CsvBindByName(column = "countryCode")
  private String countryCode;

  @ApiModelProperty(name = "confirmed", value = "Confirmed Cases")
  @CsvBindByName
  @Field(name = "confirmed", type = FieldType.Long)
  private long confirmed;

  @CsvBindByName
  private long confirmedDelta;

  @CsvBindByName
  private double confirmedGrowthRate;

  @ApiModelProperty(name = "recovered", value = "Recovered Cases")
  @CsvBindByName
  @Field(name = "recovered", type = FieldType.Long)
  private long recovered;

  @CsvBindByName
  private long recoveredDelta;

  @CsvBindByName
  private double recoveredGrowthRate;

  @ApiModelProperty(name = "deceased", value = "Deceased Cases")
  @CsvBindByName
  @Field(name = "deceased", type = FieldType.Long)
  private long deceased;

  @CsvBindByName
  private long deceasedDelta;

  @CsvBindByName
  private double deceasedGrowthRate;

  @ApiModelProperty(name = "infectious", value = "Active/Infectious Cases")
  @CsvBindByName
  @Field(name = "infectious", type = FieldType.Long)
  private long infectious;

  @CsvBindByName
  private long infectiousDelta;

  @CsvBindByName
  private double infectiousGrowthRate;

  @ApiModelProperty(name = "tested", value = "Tested Cases/People")
  @CsvBindByName
  @Field(name = "tested", type = FieldType.Long)
  private long tested;

  @CsvBindByName
  private long testedDelta;

  @CsvBindByName
  private double testedPer1k;

  @CsvBindByName
  private double incidencePer100k;

  @CsvBindByName
  private double recoveryRate;

  @CsvBindByName
  private double caseFatalityRisk;

  @CsvBindByName
  private double immunizationRate;

  @CsvBindByName
  private double doublingTime;

  // @ApiModelProperty(name = "location", value = "Searchable Geo location", required = false)
  // @CsvRecurse
  // private CustomGeoPoint location;

  @ApiModelProperty(name = "source", required = false)
  @CsvBindByName(column = "source")
  private String source;

  @ApiModelProperty(name = "importDate", value = "Import Date of this data into the system",
      required = true)
  @CsvBindByName(column = "importDate")
  @Builder.Default
  private LocalDateTime importDate = LocalDateTime.now();

  @Override
  public String getId() {
    if (id == null) {
      id = getCountry() + ":" + getDateId();
    }
    return id;
  }

}
