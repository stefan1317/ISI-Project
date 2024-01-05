package com.example.demo.excepion;

public class CountryAlreadyRegisteredException extends Exception{
    public CountryAlreadyRegisteredException(String message) {
        super(message);
    }
}
