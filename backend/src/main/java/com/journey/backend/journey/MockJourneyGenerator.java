package com.journey.backend.journey;

import com.journey.backend.budget.BudgetBreakdown;
import com.journey.backend.budget.BudgetEngine;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Deterministic, template-based generator (server-side port of the frontend's mock builders).
 * No AI and no external calls; every price is marked ESTIMATED. Replaced by the AI pipeline later.
 */
@Component
public class MockJourneyGenerator {

	private static final String ESTIMATED = "ESTIMATED";
	private static final int ARRIVAL_MINUTES = 8 * 60 + 5;

	private record Activity(String title, String description) {

	}

	private record HotelProfile(String name, int stars, double rating, List<String> amenities) {

	}

	private static final Map<String, Activity> INTEREST_ACTIVITIES = Map.of(
			"adventure", new Activity("Guided adventure activity", "An active outing with a local guide, suited to your pace."),
			"nature", new Activity("Scenic nature walk", "Unhurried time outdoors at one of the area's scenic spots."),
			"food", new Activity("Local food tasting", "Sample regional specialities at well-loved local eateries."),
			"beaches", new Activity("Beach time & water sports", "Relax on the coast or try a water activity."),
			"culture", new Activity("Heritage & culture visit", "Explore landmarks, museums and the story of the place."),
			"nightlife", new Activity("Evening out", "Live music, bars or a lively night market."),
			"shopping", new Activity("Local market stroll", "Browse crafts, souvenirs and local products."),
			"relaxation", new Activity("Slow afternoon & spa", "A deliberately unscheduled stretch to recharge."));

	private static final Map<TravelStyle, HotelProfile> HOTELS = Map.of(
			TravelStyle.BUDGET, new HotelProfile("Sunrise Stay", 3, 4.2, List.of("Breakfast", "Wi-Fi", "Air conditioning")),
			TravelStyle.BALANCED, new HotelProfile("Azure Bay Resort", 4, 4.5, List.of("Breakfast", "Pool", "Wi-Fi")),
			TravelStyle.LUXURY, new HotelProfile("The Grand Horizon", 5, 4.8, List.of("Breakfast", "Pool", "Spa")));

	// Mock-only: there is no real airport lookup yet.
	private static final Map<String, String> AIRPORT_CODES = Map.of(
			"ahmedabad", "AMD",
			"goa", "GOI",
			"manali", "KUU",
			"kerala", "COK",
			"bali", "DPS",
			"dubai", "DXB",
			"paris", "CDG");

	private final BudgetEngine budgetEngine;

	public MockJourneyGenerator(BudgetEngine budgetEngine) {
		this.budgetEngine = budgetEngine;
	}

	public GeneratedJourney generate(Journey journey) {
		int days = (int) ChronoUnit.DAYS.between(journey.getStartDate(), journey.getEndDate()) + 1;
		int nights = Math.max(days - 1, 1);
		BudgetBreakdown breakdown = budgetEngine.compute(
				journey.getBudget(), journey.getTravelers(), nights, journey.getTravelStyle().spendRatio());

		HotelProfile hotel = HOTELS.get(journey.getTravelStyle());
		String destination = journey.getDestination();
		GeneratedPlan.Flight flight = new GeneratedPlan.Flight("IndiGo", journey.getOrigin(),
				airportCode(journey.getOrigin()), destination, airportCode(destination), "06:20", "08:05",
				"1h 45m", "Non-stop", breakdown.flightPricePerPerson(), ESTIMATED);
		GeneratedPlan.Stay stay = new GeneratedPlan.Stay(hotel.name(), hotel.stars(), hotel.rating(),
				destination + " · Near the main attractions", hotel.amenities(), breakdown.stayPricePerNight(),
				nights, ESTIMATED);

		BigDecimal estimatedCost = BigDecimal.valueOf(breakdown.total());
		return new GeneratedJourney(
				summary(journey.getInterests(), estimatedCost, journey.getBudget()),
				estimatedCost,
				new GeneratedPlan(flight, stay, breakdown.lines()),
				itinerary(journey, days, hotel.name(), stay.area(), flight.destinationCode()));
	}

	private static String summary(List<String> interests, BigDecimal estimatedCost, BigDecimal budget) {
		String themes = joinWithAnd(interests.stream().map(i -> i.toLowerCase(Locale.ROOT)).toList());
		return estimatedCost.compareTo(budget) <= 0
				? "This journey balances " + themes + " while keeping the plan within your budget."
				: "This journey balances " + themes
						+ ", but the estimate is above your budget. Consider fewer days or a lighter travel style.";
	}

	private static String joinWithAnd(List<String> items) {
		if (items.size() <= 1) {
			return String.join("", items);
		}
		return String.join(", ", items.subList(0, items.size() - 1)) + " and " + items.get(items.size() - 1);
	}

	private static String airportCode(String city) {
		String key = city.trim().toLowerCase(Locale.ROOT);
		String known = AIRPORT_CODES.get(key);
		return known != null ? known : key.substring(0, Math.min(3, key.length())).toUpperCase(Locale.ROOT);
	}

	private static Activity activityFor(List<String> interests, int offset, String destination) {
		String interest = interests.get(Math.floorMod(offset, interests.size())).toLowerCase(Locale.ROOT);
		return INTEREST_ACTIVITIES.getOrDefault(interest,
				new Activity("Explore " + destination, "Time to explore at your own pace."));
	}

	private List<ItineraryItem> itinerary(Journey journey, int days, String hotelName, String hotelArea,
			String airportCode) {
		List<ItineraryItem> items = new ArrayList<>();
		String destination = journey.getDestination();
		String around = "Around " + destination;
		String airport = airportCode + " Airport";
		List<String> interests = journey.getInterests();

		for (int day = 1; day <= days; day++) {
			if (days == 1) {
				add(items, journey, day, at(9), ItemKind.FOOD, "Breakfast", around, "Start the day with a local breakfast.");
				add(items, journey, day, at(11), activityFor(interests, 0, destination), around);
				add(items, journey, day, at(13), ItemKind.FOOD, "Lunch", around, "A relaxed lunch at a local favourite.");
				add(items, journey, day, at(16), activityFor(interests, 1, destination), around);
			} else if (day == 1) {
				add(items, journey, day, ARRIVAL_MINUTES, ItemKind.TRAVEL, "Arrive in " + destination, airport,
						"Arrive and transfer to your hotel.");
				add(items, journey, day, at(11), ItemKind.STAY, "Check-in at " + hotelName, hotelArea,
						"Settle in and freshen up.");
				add(items, journey, day, at(13), ItemKind.FOOD, "Lunch", around, "A relaxed first meal at a local favourite.");
				add(items, journey, day, at(16), activityFor(interests, 0, destination), around);
				add(items, journey, day, at(20), ItemKind.FOOD, "Dinner", around, "Dinner somewhere easy near your hotel.");
			} else if (day == days) {
				add(items, journey, day, at(9), ItemKind.FOOD, "Breakfast & check-out", hotelName,
						"A slow final breakfast, then check out.");
				add(items, journey, day, at(11), ItemKind.ACTIVITY, "Last look around", around,
						"A final stroll or some last-minute shopping.");
				add(items, journey, day, at(15), ItemKind.TRAVEL, "Depart " + destination, airport,
						"Head to the airport for your journey home.");
			} else {
				add(items, journey, day, at(9), ItemKind.FOOD, "Breakfast", hotelName,
						"Start the day with breakfast at your hotel.");
				add(items, journey, day, at(11), activityFor(interests, day - 2, destination), around);
				add(items, journey, day, at(13), ItemKind.FOOD, "Lunch", around, "Lunch at a well-reviewed local spot.");
				add(items, journey, day, at(16), activityFor(interests, day - 1, destination), around);
				add(items, journey, day, at(20), ItemKind.FOOD, "Dinner", around, "Dinner to round off the day.");
			}
		}
		return items;
	}

	private static int at(int hours) {
		return hours * 60;
	}

	private static void add(List<ItineraryItem> items, Journey journey, int day, int minutes, ItemKind kind,
			String title, String place, String description) {
		items.add(new ItineraryItem(journey.getId(), day, minutes, kind, title, place, description, ItemOrigin.AI));
	}

	private static void add(List<ItineraryItem> items, Journey journey, int day, int minutes, Activity activity,
			String place) {
		add(items, journey, day, minutes, ItemKind.ACTIVITY, activity.title(), place, activity.description());
	}
}
