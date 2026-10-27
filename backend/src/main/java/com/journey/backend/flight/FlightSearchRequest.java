package com.journey.backend.flight;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record FlightSearchRequest(
		@NotBlank(message = "is required")
		@Pattern(regexp = "[A-Za-z]{3}", message = "must be a 3-letter IATA code")
		String from,

		@NotBlank(message = "is required")
		@Pattern(regexp = "[A-Za-z]{3}", message = "must be a 3-letter IATA code")
		String to,

		@Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "must be yyyy-MM-dd")
		String date,

		@Min(1) @Max(50)
		Integer limit) {

	private static final int DEFAULT_LIMIT = 10;

	public FlightSearchRequest {
		if (date != null && date.isBlank()) {
			date = null;
		}
		if (limit == null) {
			limit = DEFAULT_LIMIT;
		}
	}
}
