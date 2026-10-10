package com.journey.backend.auth.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;

/**
 * Reads the JWT from the auth cookie only (the Authorization header is intentionally ignored).
 * Login/register/logout are skipped so a stale or expired cookie can never block them.
 */
@Component
public class CookieBearerTokenResolver implements BearerTokenResolver {

	private static final Set<String> UNAUTHENTICATED_PATHS =
			Set.of("/api/auth/login", "/api/auth/register", "/api/auth/logout");

	private final AuthCookies authCookies;

	public CookieBearerTokenResolver(AuthCookies authCookies) {
		this.authCookies = authCookies;
	}

	@Override
	public String resolve(HttpServletRequest request) {
		if (UNAUTHENTICATED_PATHS.contains(request.getRequestURI()) || request.getCookies() == null) {
			return null;
		}
		for (Cookie cookie : request.getCookies()) {
			if (cookie.getName().equals(authCookies.name()) && !cookie.getValue().isBlank()) {
				return cookie.getValue();
			}
		}
		return null;
	}
}
