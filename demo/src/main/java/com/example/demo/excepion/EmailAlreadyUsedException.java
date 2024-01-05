package com.example.demo.excepion;

public class EmailAlreadyUsedException extends Exception{
    public EmailAlreadyUsedException(String message) {
        super(message);
    }
}
