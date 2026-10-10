package com.journey.backend.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * CSRF defence for cookie authentication: every state-changing request must carry a custom header.
 * Browsers cannot add it cross-origin without a CORS preflight, which only the configured frontend
 * origin passes. Used together with SameSite cookies.
 */
public class CsrfHeaderFilter extends OncePerRequestFilter {

	public static final String HEADER = "X-Requested-With";
	public static final String VALUE = "XMLHttpRequest";

	private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS", "TRACE");
	private static final String BODY =
			"{\"code\":\"CSRF_REJECTED\",\"message\":\"Missing or invalid request header.\"}";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		if (SAFE_METHODS.contains(request.getMethod()) || VALUE.equals(request.getHeader(HEADER))) {
			chain.doFilter(request, response);
			return;
		}
		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write(BODY);
	}
}
