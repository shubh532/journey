package com.journey.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.journey.backend.auth.dto.LoginRequest;
import com.journey.backend.auth.dto.RegisterRequest;
import com.journey.backend.auth.security.JwtConfig;
import com.journey.backend.auth.security.JwtProperties;
import com.journey.backend.auth.security.JwtService;
import com.journey.backend.auth.security.SecurityConfig;
import com.journey.backend.auth.security.UserDetailsServiceImpl;
import com.journey.backend.exception.ApiException;
import com.journey.backend.user.User;
import com.journey.backend.user.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

class AuthServiceTest {

	private static final JwtProperties PROPS =
			new JwtProperties("test-secret-test-secret-test-secret-123456", 60);

	private UserRepository userRepository;
	private PasswordEncoder passwordEncoder;
	private JwtConfig jwtConfig;
	private AuthService authService;

	@BeforeEach
	void setUp() {
		userRepository = mock(UserRepository.class);
		SecurityConfig securityConfig = new SecurityConfig();
		passwordEncoder = securityConfig.passwordEncoder();
		jwtConfig = new JwtConfig();
		var authManager = securityConfig.authenticationManager(
				new UserDetailsServiceImpl(userRepository), passwordEncoder);
		var jwtService = new JwtService(jwtConfig.jwtEncoder(PROPS), PROPS);
		authService = new AuthService(userRepository, passwordEncoder, authManager, jwtService);
		when(userRepository.saveAndFlush(any(User.class))).thenAnswer(inv -> {
			User u = inv.getArgument(0);
			ReflectionTestUtils.setField(u, "id", java.util.UUID.randomUUID());
			return u;
		});
	}

	@Test
	void registerHashesPasswordNormalizesEmailAndIssuesValidToken() {
		AuthResult response = authService.register(
				new RegisterRequest(" Shubham ", "  User@Example.COM ", "Password123"));

		ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
		verify(userRepository).saveAndFlush(saved.capture());
		User user = saved.getValue();
		assertThat(user.getEmail()).isEqualTo("user@example.com");
		assertThat(user.getFullName()).isEqualTo("Shubham");
		assertThat(user.getPasswordHash()).isNotEqualTo("Password123").startsWith("$2");
		assertThat(passwordEncoder.matches("Password123", user.getPasswordHash())).isTrue();

		assertThat(response.user().email()).isEqualTo("user@example.com");
		Jwt jwt = jwtConfig.jwtDecoder(PROPS).decode(response.token());
		assertThat(jwt.getSubject()).isEqualTo(user.getId().toString());
		assertThat(jwt.<String>getClaim("email")).isEqualTo("user@example.com");
	}

	@Test
	void registerRejectsDuplicateEmail() {
		when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

		assertThatThrownBy(() -> authService.register(
				new RegisterRequest("A", "USER@example.com", "Password123")))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getCode()).isEqualTo("EMAIL_ALREADY_REGISTERED"));
		verify(userRepository, never()).saveAndFlush(any());
	}

	@Test
	void registerMapsUniqueConstraintRaceToDuplicateEmail() {
		when(userRepository.saveAndFlush(any(User.class))).thenThrow(new DataIntegrityViolationException("dup"));

		assertThatThrownBy(() -> authService.register(
				new RegisterRequest("A", "user@example.com", "Password123")))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getCode()).isEqualTo("EMAIL_ALREADY_REGISTERED"));
	}

	@Test
	void loginSucceedsWithCorrectPassword() {
		User stored = new User("A", "user@example.com", passwordEncoder.encode("Password123"));
		ReflectionTestUtils.setField(stored, "id", java.util.UUID.randomUUID());
		when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(stored));

		AuthResult response = authService.login(new LoginRequest("User@Example.com", "Password123"));

		assertThat(response.token()).isNotBlank();
		assertThat(response.user().id()).isEqualTo(stored.getId());
	}

	@Test
	void loginFailsIdenticallyForWrongPasswordAndUnknownEmail() {
		User stored = new User("A", "user@example.com", passwordEncoder.encode("Password123"));
		when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(stored));
		when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

		for (LoginRequest bad : new LoginRequest[] {
				new LoginRequest("user@example.com", "WrongPass1"),
				new LoginRequest("nobody@example.com", "Password123") }) {
			assertThatThrownBy(() -> authService.login(bad))
					.isInstanceOfSatisfying(ApiException.class, e -> {
						assertThat(e.getCode()).isEqualTo("INVALID_CREDENTIALS");
						assertThat(e.getMessage()).isEqualTo("Invalid email or password.");
					});
		}
	}

}
