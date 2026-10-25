package com.journey.backend.budget;

import static org.assertj.core.api.Assertions.assertThat;

import com.journey.backend.journey.TravelStyle;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class BudgetEngineTest {

	private final BudgetEngine engine = new BudgetEngine();

	@Test
	void matchesTheFrontendModelForABalancedTrip() {
		// 50,000 budget, 2 travellers, 4 nights, balanced (85%) -> target 42,500.
		BudgetBreakdown b = engine.compute(new BigDecimal("50000"), 2, 4, TravelStyle.BALANCED.spendRatio());

		assertThat(b.flightPricePerPerson()).isEqualTo(6380);
		assertThat(b.flights()).isEqualTo(12760);
		assertThat(b.stayPricePerNight()).isEqualTo(5600);
		assertThat(b.stay()).isEqualTo(22400);
		assertThat(b.food()).isEqualTo(4000);
		assertThat(b.activities()).isEqualTo(2500);
		assertThat(b.localTravel()).isEqualTo(720);
		assertThat(b.total()).isEqualTo(42380);
	}

	@Test
	void estimateStaysWithinBudgetForEveryStyle() {
		for (TravelStyle style : TravelStyle.values()) {
			BudgetBreakdown b = engine.compute(new BigDecimal("25000"), 2, 6, style.spendRatio());
			assertThat(b.total()).isLessThanOrEqualTo(25000);
		}
	}

	@Test
	void luxuryCostsMoreThanBudgetStyle() {
		BigDecimal budget = new BigDecimal("80000");
		long budgetStyle = engine.compute(budget, 2, 5, TravelStyle.BUDGET.spendRatio()).total();
		long luxury = engine.compute(budget, 2, 5, TravelStyle.LUXURY.spendRatio()).total();

		assertThat(luxury).isGreaterThan(budgetStyle);
	}

	@Test
	void tinyBudgetsStillShowNonZeroMinimums() {
		BudgetBreakdown b = engine.compute(new BigDecimal("500"), 1, 1, TravelStyle.BUDGET.spendRatio());

		assertThat(b.flights()).isGreaterThanOrEqualTo(10);
		assertThat(b.stay()).isGreaterThanOrEqualTo(100);
		assertThat(b.food()).isGreaterThanOrEqualTo(100);
		assertThat(b.activities()).isGreaterThanOrEqualTo(100);
	}

	@Test
	void linesListEveryCategoryAndSumToTheTotal() {
		BudgetBreakdown b = engine.compute(new BigDecimal("50000"), 2, 4, TravelStyle.BALANCED.spendRatio());

		assertThat(b.lines()).extracting(BudgetLine::label)
				.containsExactly("Flights", "Stay", "Food", "Activities", "Local travel");
		assertThat(b.lines().stream().mapToLong(BudgetLine::amount).sum()).isEqualTo(b.total());
	}
}
