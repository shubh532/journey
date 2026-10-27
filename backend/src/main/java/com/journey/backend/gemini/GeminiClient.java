package com.journey.backend.gemini;

import com.journey.backend.exception.ApiException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class GeminiClient {

	private static final Duration TIMEOUT = Duration.ofSeconds(30);

	private final WebClient webClient;
	private final String apiKey;
	private final String model;

	@Autowired
	public GeminiClient(@Value("${gemini.api-key:}") String apiKey,
			@Value("${gemini.base-url}") String apiUrl,
			@Value("${gemini.model}") String model) {
		this(WebClient.builder().baseUrl(apiUrl).build(), apiKey, model);
	}

	GeminiClient(WebClient webClient, String apiKey, String model) {
		this.webClient = webClient;
		this.apiKey = apiKey;
		this.model = model;
	}

	/** Sends a single-turn prompt and returns the generated text. */
	public String generate(String prompt) {
		if (apiKey == null || apiKey.isBlank()) {
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "GEMINI_UNAVAILABLE",
					"Gemini is not configured.");
		}
		Map<String, Object> body = Map.of("contents",
				List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
		GeminiResponse response;
		try {
			response = webClient.post()
					.uri("/models/{model}:generateContent", model)
					.header("x-goog-api-key", apiKey)
					.bodyValue(body)
					.retrieve()
					.bodyToMono(GeminiResponse.class)
					.block(TIMEOUT);
		}
		catch (WebClientResponseException e) {
			throw upstream("status " + e.getStatusCode().value());
		}
		catch (WebClientRequestException e) {
			throw upstream("a connection error");
		}
		return extractText(response);
	}

	private static String extractText(GeminiResponse response) {
		if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
			// Gemini returns no candidates when the prompt itself is blocked.
			throw upstream("no candidates");
		}
		GeminiResponse.Candidate candidate = response.candidates().get(0);
		if (candidate.content() == null || candidate.content().parts() == null) {
			throw upstream("an empty candidate (finish reason " + candidate.finishReason() + ")");
		}
		return candidate.content().parts().stream()
				.map(GeminiResponse.Part::text)
				.filter(Objects::nonNull)
				.collect(Collectors.joining());
	}

	private static ApiException upstream(String detail) {
		return new ApiException(HttpStatus.BAD_GATEWAY, "GEMINI_ERROR", "Gemini failed with " + detail + ".");
	}
}
