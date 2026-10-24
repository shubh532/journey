package com.journey.backend.journey.dto;

import com.journey.backend.journey.TravelStyle;
import com.journey.backend.journey.TripType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateJourneyRequest(

		@NotBlank(message = "Origin is required")
		@Size(max = 120)
		String origin,

		@NotBlank(message = "Destination is required")
		@Size(max = 120)
		String destination,

		@NotNull(message = "Start date is required")
		LocalDate startDate,

		@NotNull(message = "End date is required")
		LocalDate endDate,

		@Min(value = 1, message = "Travelers must be between 1 and 10")
		@Max(value = 10, message = "Travelers must be between 1 and 10")
		int travelers,

		@NotNull(message = "Trip type is required")
		TripType tripType,

		@NotNull(message = "Budget is required")
		@Positive(message = "Budget must be positive")
		@Digits(integer = 10, fraction = 2)
		BigDecimal budget,

		@NotNull(message = "Travel style is required")
		TravelStyle travelStyle,

		@NotEmpty(message = "Choose at least one interest")
		@Size(max = 8, message = "Choose at most 8 interests")
		List<@NotBlank @Size(max = 40) String> interests,

		@Size(max = 120)
		String title
	) {

}
