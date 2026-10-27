package com.journey.backend.tavily;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tavily")
@Validated
public class TavilyController {

	private final TavilyService tavilyService;

	public TavilyController(TavilyService tavilyService) {
		this.tavilyService = tavilyService;
	}

	@GetMapping("/search")
	public Map<String, Object> search(
			@RequestParam("q")
			@NotBlank String query,
			@RequestParam(value = "maxResults",defaultValue = "5")
			@Min(1) @Max(10) int maxResults
	) {
		return tavilyService.search(query, maxResults);
	}
}
