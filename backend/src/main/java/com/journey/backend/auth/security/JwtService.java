package com.journey.backend.auth.security;

import com.journey.backend.user.User;
import java.time.Duration;
import java.time.Instant;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/** Issues signed access tokens. Validation is done by the {@code JwtDecoder} in the security filter chain. */
@Service
public class JwtService {

	private static final String ISSUER = "journey";

	private final JwtEncoder encoder;
	private final Duration lifetime;

	public JwtService(JwtEncoder encoder, JwtProperties properties) {
		this.encoder = encoder;
		this.lifetime = Duration.ofMinutes(properties.expirationMinutes());
	}

	public String generateToken(User user) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(ISSUER)
				.subject(user.getId().toString())
				.claim("email", user.getEmail())
				.issuedAt(now)
				.expiresAt(now.plus(lifetime))
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public long expiresInSeconds() {
		return lifetime.toSeconds();
	}
}
