package com.journey.backend.auth;

import com.journey.backend.auth.dto.LoginRequest;
import com.journey.backend.auth.dto.RegisterRequest;
import com.journey.backend.auth.dto.UserResponse;
import com.journey.backend.auth.security.AuthCookies;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final AuthCookies authCookies;

	public AuthController(AuthService authService, AuthCookies authCookies) {
		this.authService = authService;
		this.authCookies = authCookies;
	}

	@PostMapping("/register")
	public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
		return withAuthCookie(HttpStatus.CREATED, authService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
		return withAuthCookie(HttpStatus.OK, authService.login(request));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout() {
		return ResponseEntity.noContent()
				.header(HttpHeaders.SET_COOKIE, authCookies.clear().toString())
				.build();
	}

	@GetMapping("/me")
	public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
		return authService.currentUser(UUID.fromString(jwt.getSubject()));
	}

	private ResponseEntity<UserResponse> withAuthCookie(HttpStatus status, AuthResult result) {
		return ResponseEntity.status(status)
				.header(HttpHeaders.SET_COOKIE, authCookies.create(result.token(), result.expiresInSeconds()).toString())
				.body(result.user());
	}
}
