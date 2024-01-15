package com.example.demo.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class Credentials {
    private String email;
    private String password;
}