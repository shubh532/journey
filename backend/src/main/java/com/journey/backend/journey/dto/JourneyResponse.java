package com.journey.backend.journey.dto;

import com.journey.backend.journey.Journey;
import com.journey.backend.journey.JourneyStatus;
import com.journey.backend.journey.TravelStyle;
import com.journey.backend.journey.TripType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record JourneyResponse(
		UUID id,
		String title,
		String origin,
		String destination,
		LocalDate startDate,
		LocalDate endDate,
		int travelers,
		TripType tripType,
		BigDecimal budget,
		TravelStyle travelStyle,
		List<String> interests,
		JourneyStatus status,
		Instant createdAt,
		Instant updatedAt) {

	public static JourneyResponse from(Journey journey) {
		return new JourneyResponse(journey.getId(), journey.getTitle(), journey.getOrigin(),
				journey.getDestination(), journey.getStartDate(), journey.getEndDate(), journey.getTravelers(),
				journey.getTripType(), journey.getBudget(), journey.getTravelStyle(), journey.getInterests(),
				journey.getStatus(), journey.getCreatedAt(), journey.getUpdatedAt());
	}
}
