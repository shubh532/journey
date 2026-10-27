package com.journey.backend.tavily;

import com.journey.backend.exception.ApiException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class TavilyService {

	private static final ParameterizedTypeReference<Map<String, Object>> RESULT_TYPE =
			new ParameterizedTypeReference<>() {
			};

	private final WebClient webClient;

	public TavilyService(@Value("${tavily.api.key}") String apiKey, @Value("${tavily.api.url}") String apiUrl) {
		this.webClient = WebClient.builder()
				.baseUrl(apiUrl)
				.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
				.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.build();
	}

	public Map<String, Object> search(String query, int maxResults) {
		Map<String, Object> body = Map.of(
				"query", query,
				"max_results", maxResults,
				"include_answer", true);
		try {
			return webClient.post()
					.bodyValue(body)
					.retrieve()
					.bodyToMono(RESULT_TYPE)
					.block();
		}
		catch (WebClientResponseException e) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "TAVILY_ERROR",
					"Tavily request failed with status " + e.getStatusCode().value());
		}
	}
}
