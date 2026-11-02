package com.journey.backend.journey;

/** Produces the plan, costs and itinerary for a saved journey. */
public interface JourneyGenerator {

	GeneratedJourney generate(Journey journey);
}
