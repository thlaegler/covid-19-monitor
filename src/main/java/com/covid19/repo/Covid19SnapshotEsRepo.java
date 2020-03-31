package com.covid19.repo;


import java.time.LocalDateTime;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.stereotype.Repository;
import com.covid19.model.Covid19Snapshot;


@Repository
public interface Covid19SnapshotEsRepo extends AbstractEsRepo<Covid19Snapshot> {

  //@formatter:off
  @Query("{\n" + 
      "  \"bool\": {\n" + 
      "    \"must\": [\n" + 
      "      {\n" + 
      "        \"match\": {\n" + 
      "          \"lastUpdate\": \"?0\"\n" + 
      "        }\n" + 
      "      }\n " +
      "    ]\n" + 
      "  }\n" + 
      "}")
  @Cacheable(value = "Covid19SnapshotByLastUpdate")
  Iterable<Covid19Snapshot> findByLastUpdate(LocalDateTime lastUpdate);
  // @formatter:on

  Iterable<Covid19Snapshot> findByCountry(String countryRegion);

  Iterable<Covid19Snapshot> findByDateId(String dateId);

}
