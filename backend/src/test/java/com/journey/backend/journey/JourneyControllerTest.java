package com.journey.backend.journey;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.journey.backend.auth.security.AuthCookies;
import com.journey.backend.auth.security.CookieBearerTokenResolver;
import com.journey.backend.auth.security.JwtConfig;
import com.journey.backend.auth.security.SecurityConfig;
import com.journey.backend.exception.ApiException;
import com.journey.backend.exception.GlobalExceptionHandler;
import com.journey.backend.journey.dto.JourneyResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(JourneyController.class)
@Import({SecurityConfig.class, JwtConfig.class, GlobalExceptionHandler.class, AuthCookies.class,
		CookieBearerTokenResolver.class})
@TestPropertySource(properties = {
		"app.jwt.secret=test-secret-test-secret-test-secret-123456",
		"app.jwt.expiration-minutes=60",
		"app.cors.allowed-origins=http://localhost:5173"
})
class JourneyControllerTest {

	private static final String XHR = "XMLHttpRequest";
	private static final UUID USER = UUID.randomUUID();
	private static final UUID ID = UUID.randomUUID();
	private static final String VALID_BODY = """
			{"origin":"Ahmedabad","destination":"Goa","startDate":"2026-12-01","endDate":"2026-12-05",
			 "travelers":2,"tripType":"Couple","budget":50000,"travelStyle":"Balanced",
			 "interests":["Beaches","Food"]}""";

	@Autowired MockMvc mvc;
	@MockitoBean JourneyService journeyService;
	@MockitoBean UserDetailsService userDetailsService;

	private static RequestPostProcessor user() {
		return jwt().jwt(j -> j.subject(USER.toString()));
	}

	private static JourneyResponse response() {
		return new JourneyResponse(ID, "Goa Journey", "Ahmedabad", "Goa", LocalDate.of(2026, 12, 1),
				LocalDate.of(2026, 12, 5), 2, TripType.COUPLE, new BigDecimal("50000"), TravelStyle.BALANCED,
				List.of("Beaches", "Food"), JourneyStatus.DRAFT, Instant.now(), Instant.now());
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(get("/api/journeys"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
	}

	@Test
	void createReturns201WithLabelsAndScopesToCurrentUser() throws Exception {
		when(journeyService.create(eq(USER), any())).thenReturn(response());

		mvc.perform(post("/api/journeys").with(user()).header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(ID.toString()))
				.andExpect(jsonPath("$.tripType").value("Couple"))
				.andExpect(jsonPath("$.travelStyle").value("Balanced"))
				.andExpect(jsonPath("$.status").value("DRAFT"));
	}

	@Test
	void createRejectsInvalidInput() throws Exception {
		mvc.perform(post("/api/journeys").with(user()).header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"origin":"","destination":"Goa","startDate":"2026-12-01","endDate":"2026-12-05",
								 "travelers":0,"tripType":"Couple","budget":-5,"travelStyle":"Balanced",
								 "interests":[]}"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
				.andExpect(jsonPath("$.fieldErrors.origin").exists())
				.andExpect(jsonPath("$.fieldErrors.travelers").exists())
				.andExpect(jsonPath("$.fieldErrors.budget").exists())
				.andExpect(jsonPath("$.fieldErrors.interests").exists());
	}

	@Test
	void createRejectsUnknownTripType() throws Exception {
		mvc.perform(post("/api/journeys").with(user()).header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content(VALID_BODY.replace("Couple", "Nonsense")))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
				.andExpect(jsonPath("$.fieldErrors.tripType").value("Must be one of: Solo, Couple, Family, Friends."));
	}

	@Test
	void createRejectsUnknownTravelStyleWithAllowedValues() throws Exception {
		mvc.perform(post("/api/journeys").with(user()).header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON)
						.content(VALID_BODY.replace("Balanced", "ADVENTURE")))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
				.andExpect(jsonPath("$.fieldErrors.travelStyle").value("Must be one of: Budget, Balanced, Luxury."));
	}

	@Test
	void createWithoutCsrfHeaderIsRejected() throws Exception {
		mvc.perform(post("/api/journeys").with(user())
						.contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("CSRF_REJECTED"));
	}

	@Test
	void listReturnsCurrentUsersJourneys() throws Exception {
		when(journeyService.list(USER)).thenReturn(List.of(response()));

		mvc.perform(get("/api/journeys").with(user()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].destination").value("Goa"));
	}

	@Test
	void getUnknownJourneyReturns404() throws Exception {
		when(journeyService.get(USER, ID)).thenThrow(
				new ApiException(HttpStatus.NOT_FOUND, "JOURNEY_NOT_FOUND", "Journey not found."));

		mvc.perform(get("/api/journeys/" + ID).with(user()))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("JOURNEY_NOT_FOUND"));
	}

	@Test
	void patchUpdatesJourney() throws Exception {
		when(journeyService.update(eq(USER), eq(ID), any())).thenReturn(response());

		mvc.perform(patch("/api/journeys/" + ID).with(user()).header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON).content("{\"travelers\":3}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(ID.toString()));
	}

	@Test
	void patchRejectsInvalidTravelers() throws Exception {
		mvc.perform(patch("/api/journeys/" + ID).with(user()).header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON).content("{\"travelers\":11}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.travelers").exists());
	}

	@Test
	void deleteReturns204() throws Exception {
		mvc.perform(delete("/api/journeys/" + ID).with(user()).header("X-Requested-With", XHR))
				.andExpect(status().isNoContent());
		verify(journeyService).delete(USER, ID);
	}
}
