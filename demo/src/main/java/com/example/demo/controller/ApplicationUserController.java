package com.example.demo.controller;

import com.example.demo.model.ApplicationUser;
import com.example.demo.service.ApplicationUserService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("user")
public class ApplicationUserController {

    final ApplicationUserService applicationUserService;

    @PostMapping("/save")
    public ApplicationUser saveUser(@RequestBody ApplicationUser applicationUser) {
        applicationUserService.saveUser(applicationUser);

        return applicationUser;
    }

    @GetMapping("/get/{id}")
    public ApplicationUser getUser(@PathVariable int id) {
        return applicationUserService.getUser(id);
    }
}
