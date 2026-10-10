package com.journey.backend.auth;

import com.journey.backend.auth.dto.UserResponse;

/** Internal result of a successful authentication; the token is delivered via cookie, never in the body. */
public record AuthResult(String token, long expiresInSeconds, UserResponse user) {}
