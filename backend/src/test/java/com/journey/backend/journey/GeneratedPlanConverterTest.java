package com.journey.backend.journey;

import static org.assertj.core.api.Assertions.assertThat;

import com.journey.backend.budget.BudgetLine;
import java.util.List;
import org.junit.jupiter.api.Test;

class GeneratedPlanConverterTest {

	private final GeneratedPlanConverter converter = new GeneratedPlanConverter();

	@Test
	void roundTripsAPlanThroughJson() {
		GeneratedPlan plan = new GeneratedPlan(
				new GeneratedPlan.Flight("IndiGo", "Ahmedabad", "AMD", "Goa", "GOI", "06:20", "08:05", "1h 45m",
						"Non-stop", 6380, "ESTIMATED"),
				new GeneratedPlan.Stay("Azure Bay Resort", 4, 4.5, "Goa · Near the main attractions",
						List.of("Breakfast", "Pool"), 5600, 4, "ESTIMATED"),
				List.of(new BudgetLine("Flights", 12760), new BudgetLine("Stay", 22400)));

		String json = converter.convertToDatabaseColumn(plan);

		assertThat(json).contains("\"airline\":\"IndiGo\"");
		assertThat(converter.convertToEntityAttribute(json)).isEqualTo(plan);
	}

	@Test
	void nullsPassThrough() {
		assertThat(converter.convertToDatabaseColumn(null)).isNull();
		assertThat(converter.convertToEntityAttribute(null)).isNull();
	}

	@Test
	void roundTripsTheGenerationReport() {
		GenerationReport report = new GenerationReport("ab12cd34", 41230, List.of(
				new GenerationReport.Step("planner", "Understanding your trip", GenerationReport.Status.OK,
						"5 areas to explore", 3100),
				new GenerationReport.Step("flight", "Finding flights", GenerationReport.Status.FALLBACK,
						"Live schedule unavailable", 120)));
		GeneratedPlan plan = new GeneratedPlan(null, null, List.of(new BudgetLine("Flights", 1)), report);

		String json = converter.convertToDatabaseColumn(plan);

		assertThat(json).contains("\"runId\":\"ab12cd34\"", "\"status\":\"FALLBACK\"");
		assertThat(converter.convertToEntityAttribute(json)).isEqualTo(plan);
	}

	@Test
	void readsPlansSavedBeforeReportsExisted() {
		String legacy = "{\"flight\":null,\"stay\":null,\"budgetBreakdown\":[{\"label\":\"Flights\",\"amount\":1}]}";

		GeneratedPlan plan = converter.convertToEntityAttribute(legacy);

		assertThat(plan.report()).isNull();
		assertThat(plan.budgetBreakdown()).hasSize(1);
	}
}
