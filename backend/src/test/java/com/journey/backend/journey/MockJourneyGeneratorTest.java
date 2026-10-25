package com.journey.backend.journey;

import static org.assertj.core.api.Assertions.assertThat;

import com.journey.backend.budget.BudgetEngine;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MockJourneyGeneratorTest {

	private final MockJourneyGenerator generator = new MockJourneyGenerator(new BudgetEngine());

	private static Journey journey(LocalDate start, LocalDate end, TravelStyle style, BigDecimal budget,
			List<String> interests) {
		return new Journey(UUID.randomUUID(), "Trip", "Ahmedabad", "Goa", start, end, 2, TripType.COUPLE, budget,
				style, interests);
	}

	@Test
	void multiDayTripHasArrivalHotelAndDepartureOnTheRightDays() {
		GeneratedJourney g = generator.generate(journey(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 4),
				TravelStyle.BALANCED, new BigDecimal("50000"), List.of("Beaches", "Food")));

		List<ItineraryItem> day1 = g.items().stream().filter(i -> i.getDay() == 1).toList();
		List<ItineraryItem> day4 = g.items().stream().filter(i -> i.getDay() == 4).toList();

		assertThat(day1.get(0).getKind()).isEqualTo(ItemKind.TRAVEL);
		assertThat(day1.get(0).getTitle()).isEqualTo("Arrive in Goa");
		assertThat(day1.get(0).getStartMinutes()).isEqualTo(8 * 60 + 5);
		assertThat(day1).anyMatch(i -> i.getKind() == ItemKind.STAY && i.getTitle().startsWith("Check-in at"));
		assertThat(day4).extracting(ItineraryItem::getTitle).contains("Depart Goa");
		assertThat(g.items()).extracting(ItineraryItem::getDay).containsOnly(1, 2, 3, 4);
	}

	@Test
	void singleDayTripHasNoFlightOrHotelItems() {
		LocalDate day = LocalDate.of(2026, 12, 1);
		GeneratedJourney g = generator.generate(
				journey(day, day, TravelStyle.BUDGET, new BigDecimal("10000"), List.of("Food")));

		assertThat(g.items()).extracting(ItineraryItem::getDay).containsOnly(1);
		assertThat(g.items()).noneMatch(i -> i.getKind() == ItemKind.TRAVEL || i.getKind() == ItemKind.STAY);
		assertThat(g.plan().stay().nights()).isEqualTo(1);
	}

	@Test
	void itemsAreOrderedWithinEachDay() {
		GeneratedJourney g = generator.generate(journey(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5),
				TravelStyle.BALANCED, new BigDecimal("50000"), List.of("Adventure")));

		for (int day = 1; day <= 5; day++) {
			int d = day;
			List<Integer> times = g.items().stream().filter(i -> i.getDay() == d)
					.map(ItineraryItem::getStartMinutes).toList();
			assertThat(times).isSorted();
		}
	}

	@Test
	void travelStyleSelectsTheHotelAndEverythingIsMarkedEstimated() {
		GeneratedJourney luxury = generator.generate(journey(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5),
				TravelStyle.LUXURY, new BigDecimal("90000"), List.of("Nature")));

		assertThat(luxury.plan().stay().stars()).isEqualTo(5);
		assertThat(luxury.plan().stay().priceSource()).isEqualTo("ESTIMATED");
		assertThat(luxury.plan().flight().priceSource()).isEqualTo("ESTIMATED");
	}

	@Test
	void knownCitiesGetRealAirportCodesAndUnknownOnesFallBackToThreeLetters() {
		Journey known = journey(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5), TravelStyle.BALANCED,
				new BigDecimal("50000"), List.of("Food"));
		Journey unknown = new Journey(UUID.randomUUID(), "Trip", "Surat", "Udaipur", LocalDate.of(2026, 12, 1),
				LocalDate.of(2026, 12, 5), 2, TripType.COUPLE, new BigDecimal("50000"), TravelStyle.BALANCED,
				List.of("Food"));

		GeneratedPlan.Flight knownFlight = generator.generate(known).plan().flight();
		GeneratedPlan.Flight unknownFlight = generator.generate(unknown).plan().flight();

		assertThat(knownFlight.originCode()).isEqualTo("AMD");
		assertThat(knownFlight.destinationCode()).isEqualTo("GOI");
		assertThat(unknownFlight.originCode()).isEqualTo("SUR");
		assertThat(unknownFlight.destinationCode()).isEqualTo("UDA");
	}

	@Test
	void summaryAdmitsWhenTheEstimateExceedsTheBudget() {
		// 500 budget: the engine's minimum amounts push the estimate above it.
		GeneratedJourney g = generator.generate(journey(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5),
				TravelStyle.BUDGET, new BigDecimal("500"), List.of("Food")));

		assertThat(g.estimatedCost()).isGreaterThan(new BigDecimal("500"));
		assertThat(g.summary()).contains("above your budget");
	}

	@Test
	void unknownInterestsFallBackToAGenericActivity() {
		GeneratedJourney g = generator.generate(journey(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 3),
				TravelStyle.BALANCED, new BigDecimal("50000"), List.of("Mountain trekking")));

		assertThat(g.items()).anyMatch(i -> "Explore Goa".equals(i.getTitle()));
	}
}
