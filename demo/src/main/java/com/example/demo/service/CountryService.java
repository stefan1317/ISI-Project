package com.example.demo.service;

import com.example.demo.model.Country;
import com.example.demo.repository.CountryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CountryService {
    private final CountryRepository countryRepository;

    public Country saveCountry(Country country) {
        countryRepository.save(country);

        return country;
    }

    public List<Country> getCountriesByUserId(int userId) {
        List<Country> countries = countryRepository.findAllByUserId(userId);

        return countries;
    }
}
