package com.journey.backend.agent;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/** The itinerary agent's raw output, before the critic has checked it. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ItineraryDraft(String summary, List<Item> items) {

	@JsonIgnoreProperties(ignoreUnknown = true)
	public record Item(int day, String time, String kind, String title, String place, String description,
			String sourceUrl) {

	}
}
