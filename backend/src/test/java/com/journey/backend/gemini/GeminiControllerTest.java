package com.journey.backend.gemini;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.journey.backend.auth.security.AuthCookies;
import com.journey.backend.auth.security.CookieBearerTokenResolver;
import com.journey.backend.auth.security.JwtConfig;
import com.journey.backend.auth.security.SecurityConfig;
import com.journey.backend.exception.GlobalExceptionHandler;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(GeminiController.class)
@Import({SecurityConfig.class, JwtConfig.class, GlobalExceptionHandler.class, AuthCookies.class,
		CookieBearerTokenResolver.class})
@TestPropertySource(properties = {
		"app.jwt.secret=test-secret-test-secret-test-secret-123456",
		"app.jwt.expiration-minutes=60",
		"app.cors.allowed-origins=http://localhost:5173"
})
class GeminiControllerTest {

	private static final String XHR = "XMLHttpRequest";

	@Autowired MockMvc mvc;
	@MockitoBean GeminiClient geminiClient;
	@MockitoBean UserDetailsService userDetailsService;

	private static RequestPostProcessor user() {
		return jwt().jwt(j -> j.subject(UUID.randomUUID().toString()));
	}

	@Test
	void requiresAuthentication() throws Exception {
		mvc.perform(post("/api/gemini/generate").header("X-Requested-With", XHR)
						.contentType(MediaType.APPLICATION_JSON).content("{\"prompt\":\"hi\"}"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void returnsGeneratedText() throws Exception {
		when(geminiClient.generate("hi")).thenReturn("Hello");

		mvc.perform(post("/api/gemini/generate").header("X-Requested-With", XHR).with(user())
						.contentType(MediaType.APPLICATION_JSON).content("{\"prompt\":\"hi\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.text").value("Hello"));

		verify(geminiClient).generate("hi");
	}

	@Test
	void rejectsBlankPrompt() throws Exception {
		mvc.perform(post("/api/gemini/generate").header("X-Requested-With", XHR).with(user())
						.contentType(MediaType.APPLICATION_JSON).content("{\"prompt\":\"  \"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.prompt").value("is required"));
	}
}
