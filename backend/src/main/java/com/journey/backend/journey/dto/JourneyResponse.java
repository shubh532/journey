package com.journey.backend.journey.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.journey.backend.budget.BudgetLine;
import com.journey.backend.journey.GeneratedPlan;
import com.journey.backend.journey.Journey;
import com.journey.backend.journey.JourneyStatus;
import com.journey.backend.journey.TravelStyle;
import com.journey.backend.journey.TripType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * List responses omit flight, stay, budgetBreakdown and itinerary; detail
 * responses (create, update, get-by-id) include them.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
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
        String summary,
        BigDecimal estimatedCost,
        Instant createdAt,
        Instant updatedAt,
        GeneratedPlan.Flight flight,
        GeneratedPlan.Stay stay,
        List<BudgetLine> budgetBreakdown,
        List<ItineraryItemResponse> itinerary) {

    public static JourneyResponse from(Journey journey) {
        return build(journey, null);
    }

    public static JourneyResponse detail(Journey journey, List<ItineraryItemResponse> itinerary) {
        return build(journey, itinerary);
    }

    private static JourneyResponse build(Journey journey, List<ItineraryItemResponse> itinerary) {

        GeneratedPlan plan = itinerary == null ? null : journey.getPlanDetails();

        return new JourneyResponse(
                journey.getId(),
                journey.getTitle(),
                journey.getOrigin(),
                journey.getDestination(),
                journey.getStartDate(),
                journey.getEndDate(),
                journey.getTravelers(),
                journey.getTripType(),
                journey.getBudget(),
                journey.getTravelStyle(),
                journey.getInterests(),
                journey.getStatus(),
                journey.getSummary(),
                journey.getEstimatedCost(),
                journey.getCreatedAt(),
                journey.getUpdatedAt(),
                plan == null ? null : plan.flight(),
                plan == null ? null : plan.stay(),
                plan == null ? null : plan.budgetBreakdown(),
                itinerary
        );
    }
}
