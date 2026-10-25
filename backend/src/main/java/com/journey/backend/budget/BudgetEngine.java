package com.journey.backend.budget;

import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * Deterministic cost model (server-side port of the frontend's mock in overview.ts).
 * Money is never computed by the AI; it only ever comes from here or from a live provider.
 */
@Component
public class BudgetEngine {

	private static final double FLIGHTS_SHARE = 0.30;
	private static final double STAY_SHARE = 0.53;
	private static final double FOOD_SHARE = 0.094;
	private static final double ACTIVITIES_SHARE = 0.059;
	private static final double LOCAL_TRAVEL_SHARE = 0.017;

	/**
	 * @param budget       the traveller's total budget
	 * @param travelers    number of travellers (at least 1)
	 * @param nights       number of hotel nights (at least 1)
	 * @param spendRatio   fraction of the budget the plan aims to use (from the travel style)
	 */
	public BudgetBreakdown compute(BigDecimal budget, int travelers, int nights, double spendRatio) {
		double target = budget.doubleValue() * spendRatio;

		long flightPricePerPerson = roundTo(target * FLIGHTS_SHARE / travelers, 10);
		long stayPricePerNight = roundTo(target * STAY_SHARE / nights, 100);

		return new BudgetBreakdown(
				flightPricePerPerson,
				flightPricePerPerson * travelers,
				stayPricePerNight,
				stayPricePerNight * nights,
				roundTo(target * FOOD_SHARE, 100),
				roundTo(target * ACTIVITIES_SHARE, 100),
				roundTo(target * LOCAL_TRAVEL_SHARE, 10));
	}

	// Rounds to the nearest unit, never below one unit (so tiny budgets still show a non-zero estimate).
	private static long roundTo(double value, long unit) {
		return Math.max(unit, Math.round(value / unit) * unit);
	}
}
