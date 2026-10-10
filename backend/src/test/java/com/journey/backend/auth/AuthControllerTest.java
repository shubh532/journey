package com.journey.backend.auth;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.journey.backend.auth.dto.UserResponse;
import com.journey.backend.auth.security.AuthCookies;
import com.journey.backend.auth.security.CookieBearerTokenResolver;
import com.journey.backend.auth.security.JwtConfig;
import com.journey.backend.auth.security.SecurityConfig;
import com.journey.backend.exception.ApiException;
import com.journey.backend.exception.GlobalExceptionHandler;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtConfig.class, GlobalExceptionHandler.class, AuthCookies.class,
		CookieBearerTokenResolver.class})
@TestPropertySource(properties = {
		"app.jwt.secret=test-secret-test-secret-test-secret-123456",
		"app.jwt.expiration-minutes=60",
		"app.cors.allowed-origins=http://localhost:5173"
})
class AuthControllerTest {

	private static final String XHR = "XMLHttpRequest";
	private static final UUID ID = UUID.randomUUID();
	private static final String ORIGIN = "http://localhost:5173";

	@Autowired MockMvc mvc;
	@Autowired JwtEncoder encoder;
	@MockitoBean AuthService authService;
	@MockitoBean UserDetailsService userDetailsService;

	@Test
	void registerSetsHttpOnlyCookieAndKeepsTokenOutOfBody() throws Exception {
		when(authService.register(any())).thenReturn(
				new AuthResult("tok123", 3600, new UserResponse(ID, "A B", "a@b.com")));

		mvc.perform(post("/api/auth/register").header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"fullName\":\"A B\",\"email\":\"a@b.com\",\"password\":\"Password123\"}"))
				.andExpect(status().isCreated())
				.andExpect(header().string("Set-Cookie", allOf(
						containsString("journey_auth=tok123"), containsString("HttpOnly"),
						containsString("Secure"), containsString("SameSite=Lax"),
						containsString("Max-Age=3600"), containsString("Path=/"))))
				.andExpect(content().string(not(containsString("tok123"))))
				.andExpect(jsonPath("$.email").value("a@b.com"))
				.andExpect(jsonPath("$.passwordHash").doesNotExist());
	}

	@Test
	void loginSetsCookie() throws Exception {
		when(authService.login(any())).thenReturn(
				new AuthResult("tok123", 3600, new UserResponse(ID, "A B", "a@b.com")));

		mvc.perform(post("/api/auth/login").header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"a@b.com\",\"password\":\"Password123\"}"))
				.andExpect(status().isOk())
				.andExpect(header().string("Set-Cookie", containsString("journey_auth=tok123")));
	}

	@Test
	void registerRejectsInvalidInput() throws Exception {
		mvc.perform(post("/api/auth/register").header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"fullName\":\"\",\"email\":\"nope\",\"password\":\"weakpass\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
				.andExpect(jsonPath("$.fieldErrors.fullName").exists())
				.andExpect(jsonPath("$.fieldErrors.email").exists())
				.andExpect(jsonPath("$.fieldErrors.password").exists());
	}

	@Test
	void registerDuplicateEmailReturns409() throws Exception {
		when(authService.register(any())).thenThrow(
				new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_REGISTERED", "exists"));

		mvc.perform(post("/api/auth/register").header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"fullName\":\"A\",\"email\":\"a@b.com\",\"password\":\"Password123\"}"))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
	}

	@Test
	void loginInvalidCredentialsReturns401() throws Exception {
		when(authService.login(any())).thenThrow(
				new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password."));

		mvc.perform(post("/api/auth/login").header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"a@b.com\",\"password\":\"x\"}"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
	}

	@Test
	void logoutClearsCookie() throws Exception {
		mvc.perform(post("/api/auth/logout").header("X-Requested-With", XHR))
				.andExpect(status().isNoContent())
				.andExpect(header().string("Set-Cookie", allOf(
						containsString("journey_auth="), containsString("Max-Age=0"), containsString("HttpOnly"))));
	}

	@Test
	void stateChangingRequestWithoutCsrfHeaderIsRejected() throws Exception {
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"a@b.com\",\"password\":\"x\"}"))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
		mvc.perform(post("/api/auth/logout")).andExpect(status().isForbidden());
	}

	@Test
	void meWithoutCookieReturns401() throws Exception {
		mvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
	}

	@Test
	void meWithValidCookieReturnsCurrentUser() throws Exception {
		when(authService.currentUser(ID)).thenReturn(new UserResponse(ID, "A B", "a@b.com"));

		mvc.perform(get("/api/auth/me").cookie(new Cookie("journey_auth", token(Instant.now().plusSeconds(600)))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(ID.toString()))
				.andExpect(jsonPath("$.email").value("a@b.com"));
	}

	@Test
	void authorizationHeaderIsIgnored() throws Exception {
		mvc.perform(get("/api/auth/me").header("Authorization",
						"Bearer " + token(Instant.now().plusSeconds(600))))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void meWithExpiredCookieReturns401AndClearsCookie() throws Exception {
		mvc.perform(get("/api/auth/me").cookie(new Cookie("journey_auth", token(Instant.now().minusSeconds(3600)))))
				.andExpect(status().isUnauthorized())
				.andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
	}

	@Test
	void staleCookieDoesNotBlockLogin() throws Exception {
		when(authService.login(any())).thenReturn(
				new AuthResult("fresh", 3600, new UserResponse(ID, "A B", "a@b.com")));

		mvc.perform(post("/api/auth/login").header("X-Requested-With", XHR)
						.cookie(new Cookie("journey_auth", "garbage"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"a@b.com\",\"password\":\"Password123\"}"))
				.andExpect(status().isOk())
				.andExpect(header().string("Set-Cookie", containsString("journey_auth=fresh")));
	}

	@Test
	void otherEndpointsRequireAuthentication() throws Exception {
		mvc.perform(get("/api/anything")).andExpect(status().isUnauthorized());
	}

	@Test
	void corsAllowsCredentialsForConfiguredOriginOnly() throws Exception {
		mvc.perform(options("/api/auth/login").header("Origin", ORIGIN)
						.header("Access-Control-Request-Method", "POST")
						.header("Access-Control-Request-Headers", "content-type,x-requested-with"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", ORIGIN))
				.andExpect(header().string("Access-Control-Allow-Credentials", "true"));

		mvc.perform(options("/api/auth/login").header("Origin", "http://evil.example")
						.header("Access-Control-Request-Method", "POST"))
				.andExpect(status().isForbidden());
	}

	private String token(Instant expiresAt) {
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("journey").subject(ID.toString())
				.issuedAt(expiresAt.minusSeconds(7200)).expiresAt(expiresAt).build();
		return encoder.encode(JwtEncoderParameters.from(
				JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
	}
}
