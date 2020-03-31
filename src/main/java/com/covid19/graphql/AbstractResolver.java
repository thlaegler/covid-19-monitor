package com.covid19.graphql;

import static java.util.stream.Collectors.toList;
import java.util.List;
import java.util.stream.StreamSupport;
import com.covid19.model.AbstractModel;
import com.covid19.model.AbstractRequest;
import com.covid19.service.AbstractService;

public abstract class AbstractResolver<M extends AbstractModel> {

  protected abstract AbstractService<M> service();

  protected abstract Class<M> clazz();

  // protected M create(M entity) {
  // return service().create(entity);
  // }
  //
  // protected Iterable<M> creates(List<M> entities) {
  // return service().create(entities);
  // }
  //
  // protected String delete(String id) {
  // service().deleteById(id);
  // return "DELETED";
  // }

  protected List<M> get(AbstractRequest request) {
    return StreamSupport.stream(service().find(request).spliterator(), false).collect(toList());
  }

}
