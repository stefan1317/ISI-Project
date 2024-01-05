package com.example.demo.model;

import lombok.Data;

import java.util.Date;

@Data
public class RegisterDTO {

    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String gender;

    private String phone;

    private Date dateOfBirth;

}
