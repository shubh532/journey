package com.journey.backend.tavily;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.journey.backend.exception.ApiException;
import java.time.Duration;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

class TavilyServiceTest {

	private static TavilyService service(WebClient.Builder builder, Duration timeout) {
		return new TavilyService(builder.baseUrl("http://test/search").build(), timeout);
	}

	@Test
	void returnsTheParsedResponse() {
		TavilyService service = service(WebClient.builder().exchangeFunction(request -> Mono.just(
				ClientResponse.create(HttpStatus.OK).header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
						.body("{\"results\":[{\"url\":\"https://a.example\",\"content\":\"x\"}]}").build())),
				Duration.ofSeconds(5));

		Map<String, Object> response = service.search("goa", 3);

		assertThat(response).containsKey("results");
	}

	@Test
	void mapsATimeoutToATypedGatewayTimeout() {
		TavilyService slow = service(WebClient.builder().exchangeFunction(request -> Mono.never()),
				Duration.ofMillis(50));

		assertThatThrownBy(() -> slow.search("goa", 3)).isInstanceOfSatisfying(ApiException.class, e -> {
			assertThat(e.getStatus()).isEqualTo(HttpStatus.GATEWAY_TIMEOUT);
			assertThat(e.getCode()).isEqualTo("TAVILY_TIMEOUT");
		});
	}

	@Test
	void mapsAnUpstreamErrorToBadGateway() {
		TavilyService failing = service(WebClient.builder().exchangeFunction(request -> Mono.just(
				ClientResponse.create(HttpStatus.UNAUTHORIZED).body("{}").build())), Duration.ofSeconds(5));

		assertThatThrownBy(() -> failing.search("goa", 3)).isInstanceOfSatisfying(ApiException.class, e -> {
			assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
			assertThat(e.getCode()).isEqualTo("TAVILY_ERROR");
		});
	}
}
