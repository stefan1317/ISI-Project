package com.example.demo.controller;

import com.example.demo.model.Country;
import com.example.demo.service.CountryService;
import jakarta.websocket.server.PathParam;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("country")
public class CountryController {

    private final CountryService countryService;

    @PostMapping("/save")
    public Country saveCountry(@RequestBody Country country) {
        countryService.saveCountry(country);

        return country;
    }

    @GetMapping("/get/{userId}")
    public List<Country> getCountryByUserId(@PathVariable int userId) {
        return countryService.getCountriesByUserId(userId);
    }
}
