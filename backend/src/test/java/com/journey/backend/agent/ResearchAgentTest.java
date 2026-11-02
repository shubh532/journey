package com.journey.backend.agent;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ResearchAgentTest {

	@Test
	void foodishKindsBecomeFood() {
		assertThat(ResearchAgent.normalizeKind("Cafe / Bakery")).isEqualTo("food");
		assertThat(ResearchAgent.normalizeKind("Restaurant")).isEqualTo("food");
		assertThat(ResearchAgent.normalizeKind("FOOD")).isEqualTo("food");
	}

	@Test
	void everythingElseBecomesActivity() {
		assertThat(ResearchAgent.normalizeKind("Temple")).isEqualTo("activity");
		assertThat(ResearchAgent.normalizeKind("Mountain Pass")).isEqualTo("activity");
		assertThat(ResearchAgent.normalizeKind("Barog Tunnel")).isEqualTo("activity");
		assertThat(ResearchAgent.normalizeKind(null)).isEqualTo("activity");
	}
}
