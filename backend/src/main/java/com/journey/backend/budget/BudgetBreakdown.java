package com.journey.backend.budget;

import java.util.List;

/** Estimated spend split for a journey. All amounts are whole rupees. */
public record BudgetBreakdown(
		long flightPricePerPerson,
		long flights,
		long stayPricePerNight,
		long stay,
		long food,
		long activities,
		long localTravel) {

	public long total() {
		return flights + stay + food + activities + localTravel;
	}

	public List<BudgetLine> lines() {
		return List.of(
				new BudgetLine("Flights", flights),
				new BudgetLine("Stay", stay),
				new BudgetLine("Food", food),
				new BudgetLine("Activities", activities),
				new BudgetLine("Local travel", localTravel));
	}
}
