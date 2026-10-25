package com.journey.backend.journey;

import com.journey.backend.budget.BudgetLine;
import java.util.List;

/** The non-itinerary part of a generated journey. Stored as JSON on the journey. */
public record GeneratedPlan(Flight flight, Stay stay, List<BudgetLine> budgetBreakdown) {

	/** Prices are {@code ESTIMATED} until a live provider supplies them. */
	public record Flight(
			String airline,
			String originCity,
			String originCode,
			String destinationCity,
			String destinationCode,
			String departure,
			String arrival,
			String duration,
			String stops,
			long pricePerPerson,
			String priceSource) {

	}

	public record Stay(
			String name,
			int stars,
			double rating,
			String area,
			List<String> amenities,
			long pricePerNight,
			int nights,
			String priceSource) {

	}
}
