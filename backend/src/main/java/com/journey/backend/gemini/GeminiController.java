package com.journey.backend.gemini;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Manual smoke-test endpoint for the Gemini integration. */
@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

	private final GeminiClient geminiClient;

	public GeminiController(GeminiClient geminiClient) {
		this.geminiClient = geminiClient;
	}

	@PostMapping("/generate")
	public Map<String, String> generate(@Valid @RequestBody GeminiGenerateRequest request) {
		return Map.of("text", geminiClient.generate(request.prompt()));
	}
}
