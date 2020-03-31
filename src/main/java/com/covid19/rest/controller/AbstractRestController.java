package com.covid19.rest.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.ResponseEntity.ok;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.covid19.model.AbstractModel;
import com.covid19.model.AbstractRequest;
import com.covid19.service.AbstractService;
import io.swagger.annotations.ApiOperation;


/**
 * Common REST CRUD operations
 */
public abstract class AbstractRestController<M extends AbstractModel> {

  abstract protected AbstractService<M> service();

  // @ApiOperation(value = "Add a new Entity")
  // @PostMapping(consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
  // public ResponseEntity<M> create(@RequestBody(required = true) @NotNull M entity) {
  // // TODO: Change create URI
  // return created(URI.create("http://www.example.org")).body(service().create(entity));
  // }
  //
  // @ApiOperation(value = "Add multiple new Entities (bulk)")
  // @PostMapping(value = "/bulk", consumes = APPLICATION_JSON_VALUE,
  // produces = APPLICATION_JSON_VALUE)
  // public ResponseEntity<Iterable<M>> creates(
  // @RequestBody(required = true) @NotNull List<M> entities) {
  // // TODO: Change create URI
  // return created(URI.create("http://www.example.org")).body(service().create(entities));
  // }

  // @ApiOperation(value = "Update an Entity")
  // @PutMapping(consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
  // public ResponseEntity<M> update(@RequestBody(required = true) @NotNull M entity) {
  // return ok(service().update(entity));
  // }
  //
  // @ApiOperation(value = "Delete a Entity")
  // @DeleteMapping(consumes = APPLICATION_JSON_VALUE)
  // public ResponseEntity<?> delete(@RequestBody(required = true) @NotNull M entity) {
  // service().deleteById(entity.getId());
  // return noContent().build();
  // }
  //
  // @ApiOperation(value = "Delete a Entity by ID")
  // @DeleteMapping
  // public ResponseEntity<?> delete(@RequestParam(value = "id", required = true) String id) {
  // service().deleteById(id);
  // return noContent().build();
  // }

  @ApiOperation(value = "Get all Entities")
  @GetMapping(produces = APPLICATION_JSON_VALUE)
  public ResponseEntity<Iterable<M>> getAll() {
    return ok(service().find(AbstractRequest.builder().build()));
  }

  @ApiOperation(value = "Get a Entity by ID")
  @GetMapping(value = "/id/{id}", produces = APPLICATION_JSON_VALUE)
  public ResponseEntity<M> getById(@RequestParam(value = "id", required = true) String id) {
    // TODO: Throw NotFoundException and return 404
    return ok(service().getById(id));
  }

}
