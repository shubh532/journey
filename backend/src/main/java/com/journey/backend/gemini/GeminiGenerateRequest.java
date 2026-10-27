package com.journey.backend.gemini;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GeminiGenerateRequest(
		@NotBlank(message = "is required")
		@Size(max = 4000, message = "must be at most 4000 characters")
		String prompt) {
}
