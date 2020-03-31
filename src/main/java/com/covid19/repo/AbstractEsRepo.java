package com.covid19.repo;


import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.repository.NoRepositoryBean;


@NoRepositoryBean
abstract public interface AbstractEsRepo<M> extends ElasticsearchRepository<M, String> {

}
