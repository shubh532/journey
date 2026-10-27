package com.journey.backend.flight;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.journey.backend.exception.ApiException;
import java.net.URI;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

class AviationStackClientTest {

	private static final String BODY = """
			{"pagination":{"limit":10},"data":[{"flight_date":"2026-12-01","flight_status":"scheduled",
			 "departure":{"airport":"Ahmedabad","iata":"AMD","terminal":"1","gate":"4","scheduled":"2026-12-01T06:00:00+00:00","estimated":null},
			 "arrival":{"airport":"Goa","iata":"GOI","scheduled":"2026-12-01T07:30:00+00:00","estimated":"2026-12-01T07:40:00+00:00"},
			 "airline":{"name":"IndiGo","iata":"6E"},"flight":{"number":"123","iata":"6E123"},"live":null}]}""";

	private static AviationStackClient client(String key, HttpStatus status, String body, AtomicReference<URI> seen) {
		ExchangeFunction fn = request -> {
			seen.set(request.url());
			return Mono.just(ClientResponse.create(status)
					.header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
					.body(body).build());
		};
		return new AviationStackClient(WebClient.builder().baseUrl("http://test/v1/flights").exchangeFunction(fn).build(), key);
	}

	@Test
	void sendsQueryAndParsesResponse() {
		AtomicReference<URI> seen = new AtomicReference<>();
		AviationStackResponse response = client("k", HttpStatus.OK, BODY, seen)
				.searchFlights("AMD", "GOI", "2026-12-01", 10);

		assertThat(seen.get().getQuery()).contains("access_key=k", "dep_iata=AMD", "arr_iata=GOI",
				"flight_date=2026-12-01", "limit=10");
		assertThat(response.data()).hasSize(1);
		assertThat(response.data().get(0).flight().iata()).isEqualTo("6E123");
	}

	@Test
	void omitsDateWhenAbsent() {
		AtomicReference<URI> seen = new AtomicReference<>();
		client("k", HttpStatus.OK, BODY, seen).searchFlights("AMD", "GOI", null, 5);
		assertThat(seen.get().getQuery()).doesNotContain("flight_date");
	}

	@Test
	void failsWhenKeyMissing() {
		assertThatThrownBy(() -> client("", HttpStatus.OK, BODY, new AtomicReference<>())
				.searchFlights("AMD", "GOI", null, 5))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
	}

	@Test
	void mapsUpstreamHttpErrorToBadGateway() {
		assertThatThrownBy(() -> client("k", HttpStatus.UNAUTHORIZED, "{}", new AtomicReference<>())
				.searchFlights("AMD", "GOI", null, 5))
				.isInstanceOfSatisfying(ApiException.class, e -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
					assertThat(e.getCode()).isEqualTo("FLIGHT_PROVIDER_ERROR");
				});
	}

	@Test
	void mapsErrorBodyToBadGateway() {
		String body = "{\"error\":{\"code\":\"usage_limit_reached\",\"message\":\"x\"}}";
		assertThatThrownBy(() -> client("k", HttpStatus.OK, body, new AtomicReference<>())
				.searchFlights("AMD", "GOI", null, 5))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getMessage()).contains("usage_limit_reached"));
	}

	@Test
	void serviceMapsEntriesPreferringEstimatedTime() {
		AviationStackClient c = client("k", HttpStatus.OK, BODY, new AtomicReference<>());
		FlightResult r = new FlightService(c).search(new FlightSearchRequest("amd", "goi", null, null)).get(0);

		assertThat(r.flightNumber()).isEqualTo("6E123");
		assertThat(r.airline()).isEqualTo("IndiGo");
		assertThat(r.departureTime()).isEqualTo("2026-12-01T06:00:00+00:00");
		assertThat(r.arrivalTime()).isEqualTo("2026-12-01T07:40:00+00:00");
	}
}
