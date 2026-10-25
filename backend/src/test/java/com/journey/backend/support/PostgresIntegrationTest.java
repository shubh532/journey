package com.journey.backend.support;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Base class for tests that need the full application context against a real PostgreSQL.
 * The container is shared by all subclasses; no real secrets are required.
 */
@SpringBootTest
@Testcontainers
@TestPropertySource(properties = {
	"app.jwt.secret=test-secret-test-secret-test-secret-123456",
	"app.auth.cookie.secure=false"
})
public abstract class PostgresIntegrationTest {

	@Container
	@ServiceConnection
	static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");
}
