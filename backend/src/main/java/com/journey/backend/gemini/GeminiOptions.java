package com.journey.backend.gemini;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Per-call settings for a Gemini request.
 *
 * @param timeout        how long to wait for the response
 * @param thinkingBudget thinking tokens Gemini may spend first; 0 switches thinking off (Flash models only),
 *                       null leaves the model default. Structured JSON tasks do not need it and it adds seconds
 * @param maxOutputTokens cap on the reply length, null for the model default
 */
public record GeminiOptions(Duration timeout, Integer thinkingBudget, Integer maxOutputTokens) {

	public static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(30);

	/** Model defaults and the historical 30 s timeout. */
	public static GeminiOptions defaults() {
		return new GeminiOptions(DEFAULT_TIMEOUT, null, null);
	}

	/** For structured JSON tasks: no thinking, bounded reply. */
	public static GeminiOptions structured(Duration timeout, int maxOutputTokens) {
		return new GeminiOptions(timeout, 0, maxOutputTokens);
	}

	/** The {@code generationConfig} for a JSON reply with these options. */
	Map<String, Object> jsonGenerationConfig() {
		Map<String, Object> config = new HashMap<>();
		config.put("responseMimeType", "application/json");
		if (maxOutputTokens != null) {
			config.put("maxOutputTokens", maxOutputTokens);
		}
		if (thinkingBudget != null) {
			config.put("thinkingConfig", Map.of("thinkingBudget", thinkingBudget));
		}
		return config;
	}
}
