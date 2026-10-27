package com.journey.backend.flight;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.journey.backend.auth.security.AuthCookies;
import com.journey.backend.auth.security.CookieBearerTokenResolver;
import com.journey.backend.auth.security.JwtConfig;
import com.journey.backend.auth.security.SecurityConfig;
import com.journey.backend.exception.GlobalExceptionHandler;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(FlightController.class)
@Import({SecurityConfig.class, JwtConfig.class, GlobalExceptionHandler.class, AuthCookies.class,
		CookieBearerTokenResolver.class})
@TestPropertySource(properties = {
		"app.jwt.secret=test-secret-test-secret-test-secret-123456",
		"app.jwt.expiration-minutes=60",
		"app.cors.allowed-origins=http://localhost:5173"
})
class FlightControllerTest {

	@Autowired MockMvc mvc;
	@MockitoBean FlightService flightService;
	@MockitoBean UserDetailsService userDetailsService;

	private static RequestPostProcessor user() {
		return jwt().jwt(j -> j.subject(UUID.randomUUID().toString()));
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(get("/api/flights/search").param("from", "AMD").param("to", "GOI"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void searchesWithRequestParams() throws Exception {
		FlightResult r = new FlightResult("6E123", "IndiGo", "6E", "scheduled", "2026-12-01", "Ahmedabad", "AMD",
				null, null, "t1", "Goa", "GOI", null, null, "t2");
		when(flightService.search(new FlightSearchRequest("amd", "goi", "2026-12-01", 10))).thenReturn(List.of(r));

		mvc.perform(get("/api/flights/search").param("from", "amd").param("to", "goi")
						.param("date", "2026-12-01").with(user()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].flightNumber").value("6E123"));

		verify(flightService).search(new FlightSearchRequest("amd", "goi", "2026-12-01", 10));
	}

	@Test
	void rejectsBadIataCode() throws Exception {
		mvc.perform(get("/api/flights/search").param("from", "AHMEDABAD").param("to", "GOI").with(user()))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.from").value("must be a 3-letter IATA code"));
	}

	@Test
	void rejectsLimitOutOfRange() throws Exception {
		mvc.perform(get("/api/flights/search").param("from", "AMD").param("to", "GOI").param("limit", "99").with(user()))
				.andExpect(status().isBadRequest());
	}

	@Test
	void rejectsMissingDestination() throws Exception {
		mvc.perform(get("/api/flights/search").param("from", "AMD").with(user()))
				.andExpect(status().isBadRequest());
	}
}
