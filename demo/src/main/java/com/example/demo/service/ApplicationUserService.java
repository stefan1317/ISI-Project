package com.example.demo.service;

import com.example.demo.Utils;
import com.example.demo.excepion.EmailAlreadyUsedException;
import com.example.demo.model.ApplicationUser;
import com.example.demo.model.Credentials;
import com.example.demo.model.RegisterDTO;
import com.example.demo.model.RegisterResponseDTO;
import com.example.demo.repository.ApplicationUserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ApplicationUserService {

    private final ApplicationUserRepository applicationUserRepository;

    public ResponseEntity<RegisterResponseDTO> performRegister(RegisterDTO registerDTO)
            throws EmailAlreadyUsedException {
        Optional<ApplicationUser> userByEmailOptional = this.applicationUserRepository.findByEmail(registerDTO.getEmail());

        if (userByEmailOptional.isPresent()) {
            throw new EmailAlreadyUsedException("Email already used.");
        }

        ApplicationUser newUser = new ApplicationUser();
        newUser.setEmail(registerDTO.getEmail());
        newUser.setPassword(registerDTO.getPassword());
//        newUser.setFirstName(registerDTO.getFirstName());
//        newUser.setLastName(registerDTO.getLastName());
//        newUser.setGender(registerDTO.getGender());
//        newUser.setPhone(registerDTO.getPhone());
//        newUser.setDateOfBirth(registerDTO.getDateOfBirth());
        newUser.setNatalCountry(registerDTO.getNatalCountry());

        applicationUserRepository.save(newUser);

        return new ResponseEntity<>(new RegisterResponseDTO("User registered."), HttpStatus.OK);
    }

    public ApplicationUser saveUser (ApplicationUser applicationUser) {
        applicationUserRepository.save(applicationUser);

        return applicationUser;
    }

    public ApplicationUser performLoginAndGenerateJWT(Credentials credentials, HttpServletResponse response) {
        Optional<ApplicationUser> userOptional = this.applicationUserRepository.findByEmailAndPassword(
                credentials.getEmail(),
                credentials.getPassword()
        );

        if (userOptional.isPresent()) {
            Cookie cookie = new Cookie("auth", Utils.generateToken(userOptional.get()));
            //add cookie here
            response.addCookie(cookie);
            return userOptional.get();

        } else {
            ApplicationUser user = new ApplicationUser();
            user.setEmail("wrong");
            return user;
        }
    }

    public String logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("auth", null);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return "Logout successfully made.";
    }

    public List<ApplicationUser> getUsers() {
        return applicationUserRepository.findAll();
    }

    public ApplicationUser getUser(int id) {
        return applicationUserRepository.findById(id).orElse(null);
    }
}
