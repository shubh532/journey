package com.journey.backend.auth;

import com.journey.backend.auth.dto.LoginRequest;
import com.journey.backend.auth.dto.RegisterRequest;
import com.journey.backend.auth.dto.UserResponse;
import com.journey.backend.auth.security.JwtService;
import com.journey.backend.exception.ApiException;
import com.journey.backend.user.User;
import com.journey.backend.user.UserRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@Transactional
	public AuthResult register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmail(email)) {
			throw emailTaken();
		}
		User user = new User(request.fullName().trim(), email, passwordEncoder.encode(request.password()));
		try {
			user = userRepository.saveAndFlush(user);
		} catch (DataIntegrityViolationException e) {
			// Lost a race against a concurrent registration; the unique constraint caught it.
			throw emailTaken();
		}
		return toAuthResult(user);
	}

	@Transactional(readOnly = true)
	public AuthResult login(LoginRequest request) {
		String email = normalizeEmail(request.email());
		try {
			authenticationManager.authenticate(
					UsernamePasswordAuthenticationToken.unauthenticated(email, request.password()));
		} catch (AuthenticationException e) {
			throw invalidCredentials();
		}
		User user = userRepository.findByEmail(email).orElseThrow(AuthService::invalidCredentials);
		return toAuthResult(user);
	}

	@Transactional(readOnly = true)
	public UserResponse currentUser(UUID userId) {
		return userRepository.findById(userId)
				.map(UserResponse::from)
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED",
						"Authentication is required or the token is invalid."));
	}

	static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private AuthResult toAuthResult(User user) {
		return new AuthResult(jwtService.generateToken(user), jwtService.expiresInSeconds(),
				UserResponse.from(user));
	}

	private static ApiException emailTaken() {
		return new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_REGISTERED",
				"An account with this email already exists.");
	}

	private static ApiException invalidCredentials() {
		return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password.");
	}
}
