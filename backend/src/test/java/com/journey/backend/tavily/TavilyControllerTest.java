package com.journey.backend.tavily;

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
import com.journey.backend.exception.ApiException;
import com.journey.backend.exception.GlobalExceptionHandler;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(TavilyController.class)
@Import({SecurityConfig.class, JwtConfig.class, GlobalExceptionHandler.class, AuthCookies.class,
		CookieBearerTokenResolver.class})
@TestPropertySource(properties = {
		"app.jwt.secret=test-secret-test-secret-test-secret-123456",
		"app.jwt.expiration-minutes=60",
		"app.cors.allowed-origins=http://localhost:5173"
})
class TavilyControllerTest {

	@Autowired MockMvc mvc;
	@MockitoBean TavilyService tavilyService;
	@MockitoBean UserDetailsService userDetailsService;

	private static RequestPostProcessor user() {
		return jwt().jwt(j -> j.subject(UUID.randomUUID().toString()));
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(get("/api/tavily/search").param("q", "goa"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void returnsSearchResults() throws Exception {
		when(tavilyService.search("goa beaches", 3)).thenReturn(Map.of("answer", "Baga and Calangute"));

		mvc.perform(get("/api/tavily/search").param("q", "goa beaches").param("maxResults", "3").with(user()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.answer").value("Baga and Calangute"));

		verify(tavilyService).search("goa beaches", 3);
	}

	@Test
	void usesDefaultMaxResults() throws Exception {
		when(tavilyService.search("goa", 5)).thenReturn(Map.of());

		mvc.perform(get("/api/tavily/search").param("q", "goa").with(user()))
				.andExpect(status().isOk());

		verify(tavilyService).search("goa", 5);
	}

	@Test
	void surfacesUpstreamFailure() throws Exception {
		when(tavilyService.search("goa", 5))
				.thenThrow(new ApiException(HttpStatus.BAD_GATEWAY, "TAVILY_ERROR", "Tavily request failed"));

		mvc.perform(get("/api/tavily/search").param("q", "goa").with(user()))
				.andExpect(status().isBadGateway())
				.andExpect(jsonPath("$.code").value("TAVILY_ERROR"));
	}
}
