package com.covid19.model;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.ALWAYS;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.geo.Point;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.opencsv.bean.CsvBindByName;
import io.swagger.annotations.ApiModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@ApiModel(description = "")
@JsonInclude(ALWAYS)
@JsonIgnoreProperties(ignoreUnknown = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Validated
public class CustomGeoPoint {

  @CsvBindByName(column = "latitude", required = false)
  private double lat;

  @CsvBindByName(column = "longitude", required = false)
  private double lon;

  /**
   * build a GeoPoint from a {@link org.springframework.data.geo.Point}
   *
   * @param point {@link org.springframework.data.geo.Point}
   * @return a {@link org.springframework.data.elasticsearch.core.geo.GeoPoint}
   */
  public static GeoPoint fromPoint(Point point) {
    return new GeoPoint(point.getX(), point.getY());
  }

  public static Point toPoint(GeoPoint point) {
    return new Point(point.getLat(), point.getLon());
  }

  @Override
  public String toString() {
    return "GeoPoint{" + "lat=" + lat + ", lon=" + lon + '}';
  }
}
