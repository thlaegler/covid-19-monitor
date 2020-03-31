package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static org.springframework.data.elasticsearch.annotations.FieldType.Keyword;
import java.time.LocalDateTime;
import org.springframework.data.elasticsearch.annotations.DateFormat;
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


@ApiModel(description = "Daily Report")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Validated
public class DailyReport extends AbstractModel {

  @Field(name = "dateId", type = FieldType.Keyword)
  @CsvIgnore
  private String dateId;

  @ApiModelProperty(name = "country", value = "Country/Region", required = false)
  @JsonProperty("country")
  @JsonAlias("country")
  @Field(name = "country", type = Keyword)
  @CsvBindByName(column = "Country/Region", required = false)
  private String country;

  @ApiModelProperty(name = "provinceState", value = "Province/State", required = false)
  @JsonProperty("provinceState")
  @JsonAlias("provinceState")
  @Field(name = "provinceState", type = Keyword)
  @CsvBindByName(column = "Province/State", required = false)
  private String provinceState;

  @ApiModelProperty(name = "confirmed", value = "Confirmed Cases", required = false)
  @JsonProperty("confirmed")
  @JsonAlias("confirmed")
  @Field(name = "confirmed", type = Keyword)
  @CsvBindByName(column = "Confirmed", required = false)
  private Long confirmed;

  @ApiModelProperty(name = "recovered", value = "Recovered Cases", required = false)
  @JsonProperty("recovered")
  @JsonAlias("recovered")
  @Field(name = "recovered", type = Keyword)
  @CsvBindByName(column = "Recovered", required = false)
  private Long recovered;

  @ApiModelProperty(name = "deceased", value = "Deceased Cases", required = false)
  @JsonProperty("deceased")
  @JsonAlias("deceased")
  @Field(name = "deceased", type = Keyword)
  @CsvBindByName(column = "Deaths", required = false)
  private Long deceased;

  @ApiModelProperty(name = "importDate", value = "Import Date of this data into the system",
      required = true)
  @JsonProperty("importDate")
  @JsonAlias("importDate")
  @Field(name = "importDate", type = FieldType.Date, format = DateFormat.date_hour_minute_second)
  @CsvIgnore
  @Builder.Default
  private LocalDateTime importDate = LocalDateTime.now();

  @ApiModelProperty(name = "lastUpdate", value = "Last Update", required = false)
  @JsonProperty("lastUpdate")
  @JsonAlias("lastUpdate")
  @Field(name = "lastUpdate", type = FieldType.Text)
  @CsvBindByName(column = "Last_Update", required = false)
  private String lastUpdate;

  @Override
  public String getId() {
    if (id == null) {
      id = getCountry() + ":" + getProvinceState() + ":" + getDateId();
    }
    return id;
  }

}
