package com.journey.backend.flight;

import com.journey.backend.exception.ApiException;
import com.journey.backend.logging.LogText;
import java.time.Duration;
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
public class AviationStackClient {

	private static final Logger log = LoggerFactory.getLogger(AviationStackClient.class);

	/** Error code for a request the provider's current plan does not include; retrying it cannot succeed. */
	public static final String PLAN_RESTRICTED = "FLIGHT_PLAN_RESTRICTED";

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
		long start = System.nanoTime();
		// The access key travels in the query string, so only the other parameters are ever logged.
		log.info("AviationStack request: dep_iata={} arr_iata={} flight_date={} limit={}", depIata, arrIata,
				flightDate, limit);
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
			log.warn("AviationStack responded {} after {} ms: {}", e.getStatusCode().value(), elapsedMs(start),
					LogText.truncate(e.getResponseBodyAsString()));
			if (e.getStatusCode().value() == 403) {
				// e.g. function_access_restricted: the plan does not include this request (such as a date filter).
				throw new ApiException(HttpStatus.BAD_GATEWAY, PLAN_RESTRICTED,
						"The flight provider plan does not allow this request.");
			}
			throw upstream("status " + e.getStatusCode().value());
		}
		catch (WebClientRequestException e) {
			log.warn("AviationStack connection error after {} ms: {}", elapsedMs(start), e.getMessage());
			throw upstream("a connection error");
		}
		catch (IllegalStateException e) {
			// Reactor reports a blocking-read timeout as an IllegalStateException; say what actually happened.
			if (e.getMessage() != null && e.getMessage().startsWith("Timeout on blocking read")) {
				log.warn("AviationStack timed out after {} ms (limit {} s)", elapsedMs(start), TIMEOUT.toSeconds());
				throw new ApiException(HttpStatus.GATEWAY_TIMEOUT, "FLIGHT_PROVIDER_TIMEOUT",
						"Flight provider did not answer within " + TIMEOUT.toSeconds() + " seconds.");
			}
			throw e;
		}
		if (response != null && response.error() != null && isRestricted(response.error().code())) {
			log.warn("AviationStack plan restriction after {} ms: {}", elapsedMs(start), LogText.truncate(response));
			throw new ApiException(HttpStatus.BAD_GATEWAY, PLAN_RESTRICTED,
					"The flight provider plan does not allow this request.");
		}
		if (response == null || response.error() != null) {
			log.warn("AviationStack returned an error after {} ms: {}", elapsedMs(start),
					LogText.truncate(response));
			throw upstream(response == null ? "an empty response"
					: "error " + response.error().code());
		}
		log.info("AviationStack response: {} flights in {} ms", response.data() == null ? 0 : response.data().size(),
				elapsedMs(start));
		log.debug("AviationStack response: {}", LogText.truncate(response));
		return response;
	}

	private static boolean isRestricted(String code) {
		return code != null && code.contains("restricted");
	}

	private static long elapsedMs(long startNanos) {
		return (System.nanoTime() - startNanos) / 1_000_000;
	}

	private static ApiException upstream(String detail) {
		return new ApiException(HttpStatus.BAD_GATEWAY, "FLIGHT_PROVIDER_ERROR",
				"Flight provider failed with " + detail + ".");
	}
}
