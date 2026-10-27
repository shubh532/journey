package com.journey.backend.flight;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** Subset of the Aviationstack {@code /flights} payload that the journey backend uses. */
@JsonIgnoreProperties(ignoreUnknown = true)
record AviationStackResponse(List<Entry> data, ApiError error) {

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Entry(
			@JsonProperty("flight_date") String flightDate,
			@JsonProperty("flight_status") String flightStatus,
			Leg departure,
			Leg arrival,
			Airline airline,
			Flight flight) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Leg(String airport, String iata, String terminal, String gate, String scheduled, String estimated) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Airline(String name, String iata) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Flight(String number, String iata) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record ApiError(String code, String type, String message) {
	}
}
