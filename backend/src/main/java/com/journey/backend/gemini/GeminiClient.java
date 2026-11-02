package com.journey.backend.gemini;

import com.journey.backend.exception.ApiException;
import com.journey.backend.logging.LogText;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class GeminiClient {

	private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

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
		return send(prompt, null, GeminiOptions.defaults());
	}

	/** Like {@link #generate}, but asks Gemini to reply with a JSON document only. */
	public String generateJson(String prompt) {
		return generateJson(prompt, GeminiOptions.defaults());
	}

	/** JSON reply with an explicit timeout, thinking budget and output cap. */
	public String generateJson(String prompt, GeminiOptions options) {
		return send(prompt, options.jsonGenerationConfig(), options);
	}

	private String send(String prompt, Map<String, Object> generationConfig, GeminiOptions options) {
		if (apiKey == null || apiKey.isBlank()) {
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "GEMINI_UNAVAILABLE",
					"Gemini is not configured.");
		}
		Map<String, Object> body = new HashMap<>();
		body.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
		if (generationConfig != null) {
			body.put("generationConfig", generationConfig);
		}
		long start = System.nanoTime();
		log.info("Gemini request: model={} json={} promptChars={} timeout={}s thinkingBudget={} maxOutputTokens={}",
				model, generationConfig != null, prompt.length(), options.timeout().toSeconds(),
				options.thinkingBudget(), options.maxOutputTokens());
		log.debug("Gemini request payload: {}", LogText.truncate(body));
		GeminiResponse response;
		try {
			response = webClient.post()
					.uri("/models/{model}:generateContent", model)
					.header("x-goog-api-key", apiKey)
					.bodyValue(body)
					.retrieve()
					.bodyToMono(GeminiResponse.class)
					.block(options.timeout());
		}
		catch (WebClientResponseException e) {
			log.warn("Gemini responded {} after {} ms: {}", e.getStatusCode().value(), elapsedMs(start),
					LogText.truncate(e.getResponseBodyAsString()));
			throw upstream("status " + e.getStatusCode().value());
		}
		catch (WebClientRequestException e) {
			log.warn("Gemini connection error after {} ms: {}", elapsedMs(start), e.getMessage());
			throw upstream("a connection error");
		}
		catch (IllegalStateException e) {
			// Reactor reports a blocking-read timeout as an IllegalStateException; say what actually happened.
			if (e.getMessage() != null && e.getMessage().startsWith("Timeout on blocking read")) {
				log.warn("Gemini timed out after {} ms (limit {} s)", elapsedMs(start), options.timeout().toSeconds());
				throw new ApiException(HttpStatus.GATEWAY_TIMEOUT, "GEMINI_TIMEOUT",
						"Gemini did not answer within " + options.timeout().toSeconds() + " seconds.");
			}
			throw e;
		}
		String text;
		try {
			text = extractText(response);
		}
		catch (ApiException e) {
			log.warn("Gemini returned no usable text after {} ms ({}): {}", elapsedMs(start), e.getMessage(),
					LogText.truncate(response));
			throw e;
		}
		String finishReason = response.candidates().get(0).finishReason();
		log.info("Gemini response: finishReason={} chars={} in {} ms", finishReason, text.length(), elapsedMs(start));
		if (finishReason != null && !"STOP".equals(finishReason)) {
			log.warn("Gemini finished with {} instead of STOP, the reply may be cut off (maxOutputTokens={})",
					finishReason, options.maxOutputTokens());
		}
		log.debug("Gemini response text: {}", LogText.truncate(text));
		return text;
	}

	private static long elapsedMs(long startNanos) {
		return (System.nanoTime() - startNanos) / 1_000_000;
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
