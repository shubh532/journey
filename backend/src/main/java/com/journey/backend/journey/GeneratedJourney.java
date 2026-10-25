package com.journey.backend.journey;

import java.math.BigDecimal;
import java.util.List;

/** Everything a generator produces for one journey. */
public record GeneratedJourney(
		String summary,
		BigDecimal estimatedCost,
		GeneratedPlan plan,
		List<ItineraryItem> items) {

}
