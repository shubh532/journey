package com.journey.backend.journey.dto;

import com.journey.backend.journey.TravelStyle;
import com.journey.backend.journey.TripType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Partial update: any field left null keeps its current value. */
public record UpdateJourneyRequest(
		@Size(max = 120)
		String title,
		@Size(max = 120)
		String origin,
		@Size(max = 120)
		String destination,
		LocalDate startDate,
		LocalDate endDate,
		@Min(value = 1, message = "Travelers must be between 1 and 10")
		@Max(value = 10, message = "Travelers must be between 1 and 10")
		Integer travelers,
		TripType tripType,
		@Positive(message = "Budget must be positive")
		@Digits(integer = 10, fraction = 2)
		BigDecimal budget,
		TravelStyle travelStyle,
		@Size(min = 1, max = 8, message = "Choose between 1 and 8 interests")
		List<@NotBlank @Size(max = 40) String> interests) {

}
