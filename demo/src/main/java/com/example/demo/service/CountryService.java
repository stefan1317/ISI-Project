package com.example.demo.service;

import com.example.demo.excepion.CountryAlreadyRegisteredException;
import com.example.demo.model.Country;
import com.example.demo.model.CountryDto;
import com.example.demo.repository.CountryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class CountryService {
    private final CountryRepository countryRepository;

    public Country saveCountry(CountryDto countryDto) throws CountryAlreadyRegisteredException {
        Country oldCountry = countryRepository.findByName(countryDto.getName());

        if (oldCountry.getUserId() == countryDto.getUserId()) {
            throw new CountryAlreadyRegisteredException("The country was already visited!");
        }

        Country country = new Country();
        country.setName(country.getName());
        country.setUserId(countryDto.getUserId());
        country.setTimestamp(LocalDateTime.now());

        countryRepository.save(country);

        return country;
    }

    public List<Country> getCountriesByUserId(int userId) {
        return countryRepository.findAllByUserId(userId);
    }

    public int getNumberOfCountries(int userId) {
        return countryRepository.countByUserId(userId);
    }
}
