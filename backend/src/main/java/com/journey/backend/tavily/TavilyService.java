package com.journey.backend.tavily;

import com.journey.backend.exception.ApiException;
import com.journey.backend.logging.LogText;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class TavilyService {

	private static final Logger log = LoggerFactory.getLogger(TavilyService.class);

	private static final ParameterizedTypeReference<Map<String, Object>> RESULT_TYPE =
			new ParameterizedTypeReference<>() {
			};

	private static final Duration TIMEOUT = Duration.ofSeconds(12);

	private final WebClient webClient;
	private final Duration timeout;

	@Autowired
	public TavilyService(@Value("${tavily.api.key}") String apiKey, @Value("${tavily.api.url}") String apiUrl) {
		this(WebClient.builder()
				.baseUrl(apiUrl)
				.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
				.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.build(), TIMEOUT);
	}

	TavilyService(WebClient webClient, Duration timeout) {
		this.webClient = webClient;
		this.timeout = timeout;
	}

	public Map<String, Object> search(String query, int maxResults) {
		Map<String, Object> body = Map.of(
				"query", query,
				"max_results", maxResults,
				"include_answer", true);
		long start = System.nanoTime();
		log.info("Tavily request: query='{}' maxResults={}", query, maxResults);
		log.debug("Tavily request payload: {}", body);
		try {
			Map<String, Object> response = webClient.post()
					.bodyValue(body)
					.retrieve()
					.bodyToMono(RESULT_TYPE)
					.block(timeout);
			log.info("Tavily response: {} results in {} ms", resultCount(response),
					(System.nanoTime() - start) / 1_000_000);
			log.debug("Tavily response: {}", LogText.truncate(response));
			return response;
		}
		catch (WebClientResponseException e) {
			log.warn("Tavily responded {} after {} ms: {}", e.getStatusCode().value(),
					(System.nanoTime() - start) / 1_000_000, LogText.truncate(e.getResponseBodyAsString()));
			throw new ApiException(HttpStatus.BAD_GATEWAY, "TAVILY_ERROR",
					"Tavily request failed with status " + e.getStatusCode().value());
		}
		catch (WebClientRequestException e) {
			log.warn("Tavily connection error after {} ms: {}", (System.nanoTime() - start) / 1_000_000,
					e.getMessage());
			throw new ApiException(HttpStatus.BAD_GATEWAY, "TAVILY_ERROR",
					"Tavily request failed with a connection error.");
		}
		catch (IllegalStateException e) {
			// Reactor reports a blocking-read timeout as an IllegalStateException; say what actually happened.
			if (e.getMessage() != null && e.getMessage().startsWith("Timeout on blocking read")) {
				log.warn("Tavily timed out after {} ms (limit {} s)", (System.nanoTime() - start) / 1_000_000,
						timeout.toSeconds());
				throw new ApiException(HttpStatus.GATEWAY_TIMEOUT, "TAVILY_TIMEOUT",
						"Tavily did not answer within " + timeout.toSeconds() + " seconds.");
			}
			throw e;
		}
	}

	private static int resultCount(Map<String, Object> response) {
		return response != null && response.get("results") instanceof List<?> results ? results.size() : 0;
	}
}
