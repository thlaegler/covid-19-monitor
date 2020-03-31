package com.covid19.repo;


import org.springframework.stereotype.Repository;
import com.covid19.model.Country;


@Repository
public interface CountryEsRepo extends AbstractEsRepo<Country> {

}
