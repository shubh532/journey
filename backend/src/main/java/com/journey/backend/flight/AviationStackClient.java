package com.journey.backend.flight;

import com.journey.backend.exception.ApiException;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class AviationStackClient {

	private static final Duration TIMEOUT = Duration.ofSeconds(10);

	private final WebClient webClient;
	private final String apiKey;

	@Autowired
	public AviationStackClient(@Value("${aviationstack.api.key:}") String apiKey,
			@Value("${aviationstack.api.url}") String apiUrl) {
		this(WebClient.builder().baseUrl(apiUrl).build(), apiKey);
	}

	AviationStackClient(WebClient webClient, String apiKey) {
		this.webClient = webClient;
		this.apiKey = apiKey;
	}

	AviationStackResponse searchFlights(String depIata, String arrIata, String flightDate, int limit) {
		if (apiKey == null || apiKey.isBlank()) {
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "FLIGHT_SEARCH_UNAVAILABLE",
					"Flight search is not configured.");
		}
		AviationStackResponse response;
		try {
			response = webClient.get()
					.uri(uri -> {
						uri.queryParam("access_key", apiKey)
								.queryParam("dep_iata", depIata)
								.queryParam("arr_iata", arrIata)
								.queryParam("limit", limit);
						if (flightDate != null) {
							uri.queryParam("flight_date", flightDate);
						}
						return uri.build();
					})
					.retrieve()
					.bodyToMono(AviationStackResponse.class)
					.block(TIMEOUT);
		}
		catch (WebClientResponseException e) {
			throw upstream("status " + e.getStatusCode().value());
		}
		catch (WebClientRequestException e) {
			throw upstream("a connection error");
		}
		if (response == null || response.error() != null) {
			throw upstream(response == null ? "an empty response"
					: "error " + response.error().code());
		}
		return response;
	}

	private static ApiException upstream(String detail) {
		return new ApiException(HttpStatus.BAD_GATEWAY, "FLIGHT_PROVIDER_ERROR",
				"Flight provider failed with " + detail + ".");
	}
}
