package com.example.demo.repository;

import com.example.demo.model.ApplicationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationUserRepository extends JpaRepository<ApplicationUser, Integer> {

    Optional<ApplicationUser> findByEmailAndPassword(String email, String password);

    Optional<ApplicationUser> findByEmail(String email);
}
