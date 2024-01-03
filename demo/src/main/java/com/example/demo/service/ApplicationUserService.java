package com.example.demo.service;

import com.example.demo.model.ApplicationUser;
import com.example.demo.repository.ApplicationUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ApplicationUserService {

    private final ApplicationUserRepository applicationUserRepository;

    public ApplicationUser saveUser (ApplicationUser applicationUser) {
        applicationUserRepository.save(applicationUser);

        return applicationUser;
    }

    public List<ApplicationUser> getUsers() {
        return applicationUserRepository.findAll();
    }

    public ApplicationUser getUser(int id) {
        return applicationUserRepository.findById(id).orElse(null);
    }
}
