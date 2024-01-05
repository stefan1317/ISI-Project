package com.example.demo.controller;

import com.example.demo.excepion.CountryAlreadyRegisteredException;
import com.example.demo.model.Country;
import com.example.demo.model.CountryDto;
import com.example.demo.service.CountryService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.example.demo.Utils.NUMBER_OF_COUNTRIES;

@RestController
@AllArgsConstructor
@RequestMapping("country")
public class CountryController {

    private final CountryService countryService;

    @PostMapping("/save")
    @CrossOrigin
    public Country saveCountry(@RequestBody CountryDto countryDto) throws CountryAlreadyRegisteredException {
        return countryService.saveCountry(countryDto);
    }

    @GetMapping("/get/{userId}")
    @CrossOrigin
    public List<Country> getCountryByUserId(@PathVariable int userId) {
        return countryService.getCountriesByUserId(userId);
    }

    @GetMapping("/statistics")
    @CrossOrigin
    public int getStatistics(@RequestParam int userId) {
        int userCountries = countryService.getNumberOfCountries(userId);

        return userCountries == 0 ? 0 : (userCountries / NUMBER_OF_COUNTRIES) * 100;
    }
}
