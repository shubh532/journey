package com.journey.backend.gemini;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.journey.backend.exception.ApiException;
import java.net.URI;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

class GeminiClientTest {

	private static final String BODY = """
			{"candidates":[{"content":{"parts":[{"text":"Hello "},{"text":"Goa"}],"role":"model"},
			 "finishReason":"STOP"}],"usageMetadata":{"totalTokenCount":5}}""";

	private static GeminiClient client(String key, HttpStatus status, String body,
			AtomicReference<ClientRequest> seen) {
		ExchangeFunction fn = request -> {
			seen.set(request);
			return Mono.just(ClientResponse.create(status)
					.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
					.body(body).build());
		};
		WebClient webClient = WebClient.builder().baseUrl("http://test/v1beta").exchangeFunction(fn).build();
		return new GeminiClient(webClient, key, "gemini-test");
	}

	@Test
	void sendsPromptAndJoinsTextParts() {
		AtomicReference<ClientRequest> seen = new AtomicReference<>();
		String text = client("k", HttpStatus.OK, BODY, seen).generate("hi");

		assertThat(text).isEqualTo("Hello Goa");
		URI url = seen.get().url();
		assertThat(url.getPath()).isEqualTo("/v1beta/models/gemini-test:generateContent");
		assertThat(url.getQuery()).isNull();
		assertThat(seen.get().headers().getFirst("x-goog-api-key")).isEqualTo("k");
	}

	@Test
	void failsWhenKeyMissing() {
		assertThatThrownBy(() -> client("", HttpStatus.OK, BODY, new AtomicReference<>()).generate("hi"))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
	}

	@Test
	void mapsUpstreamHttpErrorToBadGateway() {
		assertThatThrownBy(() -> client("k", HttpStatus.FORBIDDEN, "{}", new AtomicReference<>()).generate("hi"))
				.isInstanceOfSatisfying(ApiException.class, e -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY);
					assertThat(e.getCode()).isEqualTo("GEMINI_ERROR");
				});
	}

	@Test
	void mapsBlockedPromptToBadGateway() {
		String blocked = "{\"promptFeedback\":{\"blockReason\":\"SAFETY\"}}";
		assertThatThrownBy(() -> client("k", HttpStatus.OK, blocked, new AtomicReference<>()).generate("hi"))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY));
	}
}
