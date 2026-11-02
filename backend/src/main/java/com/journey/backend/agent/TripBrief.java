package com.journey.backend.agent;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * What the planner hands to the other agents. Airport codes are null when they could not be
 * resolved, which switches the flight agent off.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record TripBrief(String originCode, String destinationCode, List<String> areas, List<String> dayThemes) {

	public TripBrief {
		areas = areas == null ? List.of() : List.copyOf(areas);
		dayThemes = dayThemes == null ? List.of() : List.copyOf(dayThemes);
	}

	static TripBrief empty() {
		return new TripBrief(null, null, List.of(), List.of());
	}
}
