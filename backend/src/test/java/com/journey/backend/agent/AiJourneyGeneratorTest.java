package com.journey.backend.agent;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.journey.backend.budget.BudgetEngine;
import com.journey.backend.journey.GeneratedJourney;
import com.journey.backend.journey.GeneratedPlan;
import com.journey.backend.journey.GenerationReport;
import com.journey.backend.journey.ItemOrigin;
import com.journey.backend.journey.Journey;
import com.journey.backend.journey.MockJourneyGenerator;
import com.journey.backend.journey.TravelStyle;
import com.journey.backend.journey.TripType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AiJourneyGeneratorTest {

	private static final int DAYS = 3;

	private final PlannerAgent planner = mock(PlannerAgent.class);
	private final ResearchAgent researcher = mock(ResearchAgent.class);
	private final FlightAgent flightAgent = mock(FlightAgent.class);
	private final ItineraryAgent itineraryAgent = mock(ItineraryAgent.class);
	private final MockJourneyGenerator baseline = new MockJourneyGenerator(new BudgetEngine());

	private final AgentExecutor executor = new AgentExecutor();

	private AiJourneyGenerator generator;
	private Journey journey;

	@BeforeEach
	void setUp() {
		generator = new AiJourneyGenerator(baseline, planner, researcher, flightAgent, itineraryAgent,
				new ItineraryCritic(), executor);
		journey = new Journey(null, "Goa Journey", "Ahmedabad", "Goa", LocalDate.of(2026, 12, 1),
				LocalDate.of(2026, 12, 3), 2, TripType.COUPLE, new BigDecimal("50000"), TravelStyle.BALANCED,
				List.of("Beaches", "Food"));
		when(planner.plan(any(), anyInt())).thenReturn(new TripBrief("AMD", "GOI", List.of("Candolim"), List.of()));
		when(researcher.research(any())).thenReturn(List.of());
		when(flightAgent.find(any(), any(), anyLong())).thenReturn(Optional.empty());
	}

	@AfterEach
	void tearDown() {
		executor.close();
	}

	private static ItineraryDraft validDraft(String summary) {
		List<ItineraryDraft.Item> items = new ArrayList<>();
		for (int day = 1; day <= DAYS; day++) {
			items.add(new ItineraryDraft.Item(day, "10:00", "activity", "Beach " + day, "Baga", "Sand",
					"https://example.com/baga"));
			items.add(new ItineraryDraft.Item(day, "20:00", "food", "Dinner " + day, "Anjuna", "Seafood", null));
		}
		return new ItineraryDraft(summary, items);
	}

	private void stubDrafts(ItineraryDraft first, ItineraryDraft... rest) {
		when(itineraryAgent.draft(any(), eq(DAYS), any(), anyList(), any(), anyList())).thenReturn(first, rest);
	}

	@Test
	void usesTheAgentItineraryAndKeepsBaselineMoney() {
		stubDrafts(validDraft("A beachy trip."));
		GeneratedJourney base = baseline.generate(journey);

		GeneratedJourney result = generator.generate(journey);

		assertThat(result.summary()).isEqualTo("A beachy trip.");
		assertThat(result.items()).hasSize(DAYS * 2).allMatch(i -> i.getOrigin() == ItemOrigin.AI);
		assertThat(result.items().get(0).getSourceUrl()).isEqualTo("https://example.com/baga");
		assertThat(result.estimatedCost()).isEqualTo(base.estimatedCost());
		assertThat(result.plan().budgetBreakdown()).isEqualTo(base.plan().budgetBreakdown());
	}

	@Test
	void attachesAReportSayingWhatEachStepContributed() {
		stubDrafts(validDraft("A beachy trip."));
		when(researcher.research(any())).thenReturn(List.of(
				new ResearchPlace("Baga Beach", "activity", "North Goa", "Sand", "https://example.com/baga")));

		GenerationReport report = generator.generate(journey).plan().report();

		assertThat(report.runId()).hasSize(8);
		assertThat(report.steps()).extracting(GenerationReport.Step::id)
				.containsExactly("planner", "research", "flight", "itinerary");
		assertThat(report.steps()).extracting(GenerationReport.Step::status).containsExactly(
				GenerationReport.Status.OK, GenerationReport.Status.OK, GenerationReport.Status.FALLBACK,
				GenerationReport.Status.OK);
		assertThat(report.steps().get(1).detail()).contains("1 places found");
		assertThat(report.steps().get(2).detail()).contains("estimated");
		assertThat(report.steps().get(3).detail()).contains("6 activities planned", "with web sources");
	}

	@Test
	void reportShowsFallbacksWhenTheItineraryAgentFails() {
		stubDrafts(null);

		GenerationReport report = generator.generate(journey).plan().report();

		GenerationReport.Step itinerary = report.steps().get(3);
		assertThat(itinerary.status()).isEqualTo(GenerationReport.Status.FALLBACK);
		assertThat(itinerary.detail()).contains("standard itinerary template");
	}

	@Test
	void reportStillAttachedWhenThePipelineThrows() {
		when(planner.plan(any(), anyInt())).thenThrow(new IllegalStateException("boom"));

		GenerationReport report = generator.generate(journey).plan().report();

		assertThat(report.steps()).allMatch(step -> step.status() == GenerationReport.Status.FALLBACK);
	}

	@Test
	void swapsInTheRealFlightButKeepsItsPriceEstimated() {
		stubDrafts(validDraft("Trip."));
		GeneratedPlan.Flight real = new GeneratedPlan.Flight("Air India", "Ahmedabad", "AMD", "Goa", "GOI", "07:10",
				"08:50", "1h 40m", "Non-stop", 4000, "ESTIMATED");
		when(flightAgent.find(any(), any(), anyLong())).thenReturn(Optional.of(real));

		GeneratedJourney result = generator.generate(journey);

		assertThat(result.plan().flight()).isEqualTo(real);
		assertThat(result.plan().stay()).isEqualTo(baseline.generate(journey).plan().stay());
	}

	@Test
	void sendsTheDraftBackOnceWhenTheCriticFindsProblems() {
		ItineraryDraft bad = new ItineraryDraft("Bad", List.of());
		stubDrafts(bad, validDraft("Fixed."));

		GeneratedJourney result = generator.generate(journey);

		assertThat(result.summary()).isEqualTo("Fixed.");
		verify(itineraryAgent, times(2)).draft(any(), eq(DAYS), any(), anyList(), any(), anyList());
	}

	@Test
	void fallsBackToTheBaselineWhenTheItineraryAgentFails() {
		stubDrafts(null);
		GeneratedJourney base = baseline.generate(journey);

		GeneratedJourney result = generator.generate(journey);

		assertThat(result.summary()).isEqualTo(base.summary());
		assertThat(result.items()).hasSameSizeAs(base.items());
		assertThat(result.items().get(0).getTitle()).isEqualTo(base.items().get(0).getTitle());
		// A failed call is not repeated with the same payload.
		verify(itineraryAgent, times(1)).draft(any(), eq(DAYS), any(), anyList(), any(), anyList());
	}

	@Test
	void fallsBackToTheBaselineWhenAnAgentThrows() {
		when(planner.plan(any(), anyInt())).thenThrow(new IllegalStateException("boom"));
		GeneratedJourney base = baseline.generate(journey);

		GeneratedJourney result = generator.generate(journey);

		assertThat(result.summary()).isEqualTo(base.summary());
		assertThat(result.items()).hasSameSizeAs(base.items());
	}
}
