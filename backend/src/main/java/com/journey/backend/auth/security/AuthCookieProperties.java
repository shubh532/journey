package com.journey.backend.auth.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.cookie")
public record AuthCookieProperties(String name, Boolean secure, String sameSite) {

	public AuthCookieProperties {
		name = (name == null || name.isBlank()) ? "journey_auth" : name;
		secure = secure == null || secure;
		sameSite = (sameSite == null || sameSite.isBlank()) ? "Lax" : sameSite;
		if ("None".equalsIgnoreCase(sameSite) && !secure) {
			throw new IllegalStateException("SameSite=None requires the Secure cookie attribute");
		}
	}
}
