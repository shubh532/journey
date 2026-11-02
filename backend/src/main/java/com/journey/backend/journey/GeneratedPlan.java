package com.journey.backend.journey;

import com.journey.backend.budget.BudgetLine;
import java.util.List;

/**
 * The non-itinerary part of a generated journey. Stored as JSON on the journey. {@code report} is null for
 * plans generated without the agent pipeline and for plans saved before reports existed.
 */
public record GeneratedPlan(Flight flight, Stay stay, List<BudgetLine> budgetBreakdown, GenerationReport report) {

	public GeneratedPlan(Flight flight, Stay stay, List<BudgetLine> budgetBreakdown) {
		this(flight, stay, budgetBreakdown, null);
	}

	public GeneratedPlan withReport(GenerationReport report) {
		return new GeneratedPlan(flight, stay, budgetBreakdown, report);
	}

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
