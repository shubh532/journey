package com.journey.backend.auth.security;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** Builds the HttpOnly authentication cookie and its expiring counterpart for logout. */
@Component
@EnableConfigurationProperties(AuthCookieProperties.class)
public class AuthCookies {

	private final AuthCookieProperties properties;

	public AuthCookies(AuthCookieProperties properties) {
		this.properties = properties;
	}

	public String name() {
		return properties.name();
	}

	public ResponseCookie create(String token, long maxAgeSeconds) {
		return build(token, Duration.ofSeconds(maxAgeSeconds));
	}

	public ResponseCookie clear() {
		return build("", Duration.ZERO);
	}

	private ResponseCookie build(String value, Duration maxAge) {
		return ResponseCookie.from(properties.name(), value)
				.httpOnly(true)
				.secure(properties.secure())
				.sameSite(properties.sameSite())
				.path("/")
				.maxAge(maxAge)
				.build();
	}
}
