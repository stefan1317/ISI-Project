package com.example.demo;

import com.example.demo.model.ApplicationUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;

public class Utils {
    public final static int NUMBER_OF_COUNTRIES = 193;

    public static String generateToken(ApplicationUser applicationUser) {

        String secret = "asdfSFS34wfsdfsdfSDSD32dfsddDDerQSNCK34SOWEK5354fdgdf4";

        Key key = new SecretKeySpec(Base64.getDecoder().decode(secret),
                SignatureAlgorithm.HS256.getJcaName());

        String jwt = Jwts.builder()
                .claim("id", applicationUser.getId())
                .setSubject(String.valueOf(applicationUser.getId()))
                .setId(String.valueOf(applicationUser.getId()))
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plus(60, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
        return jwt;
    }

    public static Jws<Claims> parseJwt(String jwtString) {
        String secret = "asdfSFS34wfsdfsdfSDSD32dfsddDDerQSNCK34SOWEK5354fdgdf4";
        Key key = new SecretKeySpec(Base64.getDecoder().decode(secret),
                SignatureAlgorithm.HS256.getJcaName());

        Jws<Claims> jwt = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwtString);

        return jwt;
    }
}
