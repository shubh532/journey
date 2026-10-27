package com.journey.backend.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/** Subset of the Gemini {@code generateContent} payload that the journey backend uses. */
@JsonIgnoreProperties(ignoreUnknown = true)
record GeminiResponse(List<Candidate> candidates) {

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Candidate(Content content, String finishReason) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Content(List<Part> parts) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Part(String text) {
	}
}
