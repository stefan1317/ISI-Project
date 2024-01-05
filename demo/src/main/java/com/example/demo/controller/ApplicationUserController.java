package com.example.demo.controller;

import com.example.demo.excepion.EmailAlreadyUsedException;
import com.example.demo.model.ApplicationUser;
import com.example.demo.model.Credentials;
import com.example.demo.model.RegisterDTO;
import com.example.demo.model.RegisterResponseDTO;
import com.example.demo.service.ApplicationUserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("user")
public class ApplicationUserController {

    final ApplicationUserService applicationUserService;

    @CrossOrigin
    @PostMapping("/login")
    public ApplicationUser userLogin(@RequestBody Credentials credentials, HttpServletResponse response) {
        return this.applicationUserService.performLoginAndGenerateJWT(credentials, response);
    }

    @PostMapping("/register")
    @CrossOrigin
    public ResponseEntity<RegisterResponseDTO> userRegister(@RequestBody RegisterDTO registerDTO)
            throws EmailAlreadyUsedException {
        return this.applicationUserService.performRegister(registerDTO);
    }

    @PostMapping("/save")
    @CrossOrigin
    public ApplicationUser saveUser(@RequestBody ApplicationUser applicationUser) {
        applicationUserService.saveUser(applicationUser);

        return applicationUser;
    }

    @GetMapping("/get/{id}")
    @CrossOrigin
    public ApplicationUser getUser(@PathVariable int id) {
        return applicationUserService.getUser(id);
    }
}
