package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import java.time.LocalDateTime;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.leangen.graphql.annotations.types.GraphQLType;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@GraphQLType(name = "AbstractRequest")
@ApiModel(description = "")
@JsonInclude(NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Validated
public class AbstractRequest {

  private String id;

  private String provinceState;

  private String dateId;

  private String countryRegion;

  private LocalDateTime lastUpdate;

  private Double lat;

  private Double lng;

  private Double radius;

  private Integer zoom;

  private Integer page;

  private Integer limit;

  private String orderBy;

  private Sort.Direction orderDirection;

}
