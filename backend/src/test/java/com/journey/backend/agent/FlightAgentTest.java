package com.journey.backend.agent;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.journey.backend.exception.ApiException;
import com.journey.backend.flight.AviationStackClient;
import com.journey.backend.flight.FlightResult;
import com.journey.backend.flight.FlightSearchRequest;
import com.journey.backend.flight.FlightService;
import com.journey.backend.journey.GeneratedPlan;
import com.journey.backend.journey.Journey;
import com.journey.backend.journey.TravelStyle;
import com.journey.backend.journey.TripType;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class FlightAgentTest {

	private final FlightService flights = mock(FlightService.class);
	private final FlightAgent agent = new FlightAgent(flights);
	private final Journey journey = new Journey(null, "Goa Journey", "Ahmedabad", "Goa", LocalDate.of(2026, 12, 1),
			LocalDate.of(2026, 12, 3), 2, TripType.COUPLE, new BigDecimal("50000"), TravelStyle.BALANCED,
			List.of("Beaches"));
	private final TripBrief brief = new TripBrief("AMD", "GOI", List.of(), List.of());

	private static FlightResult result(String airline, String departure, String arrival) {
		return new FlightResult("AI123", airline, "AI", "scheduled", "2026-12-01", "Ahmedabad", "AMD", null, null,
				departure, "Goa", "GOI", null, null, arrival);
	}

	@Test
	void mapsTheFirstUsableScheduleAndKeepsThePriceEstimated() {
		when(flights.search(any())).thenReturn(List.of(
				result(null, "2026-12-01T06:00:00+00:00", "2026-12-01T07:30:00+00:00"),
				result("Air India", "2026-12-01T07:10:00+05:30", "2026-12-01T08:55:00+05:30")));

		Optional<GeneratedPlan.Flight> flight = agent.find(journey, brief, 4000);

		assertThat(flight).hasValueSatisfying(f -> {
			assertThat(f.airline()).isEqualTo("Air India");
			assertThat(f.departure()).isEqualTo("07:10");
			assertThat(f.arrival()).isEqualTo("08:55");
			assertThat(f.duration()).isEqualTo("1h 45m");
			assertThat(f.originCode()).isEqualTo("AMD");
			assertThat(f.pricePerPerson()).isEqualTo(4000);
			assertThat(f.priceSource()).isEqualTo("ESTIMATED");
		});
	}

	@Test
	void skipsTheSearchWithoutAirportCodes() {
		assertThat(agent.find(journey, TripBrief.empty(), 4000)).isEmpty();
		verify(flights, never()).search(any());
	}

	@Test
	void isEmptyWhenTheProviderFails() {
		when(flights.search(any())).thenThrow(new ApiException(HttpStatus.BAD_GATEWAY, "FLIGHT_PROVIDER_ERROR", "x"));

		assertThat(agent.find(journey, brief, 4000)).isEmpty();
	}

	private static ApiException restricted() {
		return new ApiException(HttpStatus.BAD_GATEWAY, AviationStackClient.PLAN_RESTRICTED, "restricted");
	}

	private static final FlightResult USABLE = new FlightResult("AI123", "Air India", "AI", "scheduled", "2026-12-01",
			"Ahmedabad", "AMD", null, null, "2026-12-01T07:10:00+05:30", "Goa", "GOI", null, null,
			"2026-12-01T08:55:00+05:30");

	@Test
	void fallsBackToAnOpenSearchWhenThePlanRejectsTheDateFilter() {
		FlightAgent timed = new FlightAgent(flights, Clock.fixed(Instant.parse("2026-11-01T00:00:00Z"), ZoneOffset.UTC));
		when(flights.search(any())).thenAnswer(invocation -> {
			FlightSearchRequest request = invocation.getArgument(0);
			if (request.date() != null) {
				throw restricted();
			}
			return List.of(USABLE);
		});

		assertThat(timed.find(journey, brief, 4000)).isPresent();
		verify(flights, times(2)).search(any());

		// The restriction is remembered, so the dated search is not attempted again.
		assertThat(timed.find(journey, brief, 4000)).isPresent();
		verify(flights, times(3)).search(any());
	}

	@Test
	void stopsCallingTheProviderWhenEverySearchIsRestricted() {
		FlightAgent timed = new FlightAgent(flights, Clock.fixed(Instant.parse("2026-11-01T00:00:00Z"), ZoneOffset.UTC));
		when(flights.search(any())).thenThrow(restricted());

		assertThat(timed.find(journey, brief, 4000)).isEmpty();
		verify(flights, times(2)).search(any());

		assertThat(timed.find(journey, brief, 4000)).isEmpty();
		verify(flights, times(2)).search(any());
	}

	@Test
	void resumesSearchingAfterTheCooldown() {
		java.util.concurrent.atomic.AtomicReference<Instant> now =
				new java.util.concurrent.atomic.AtomicReference<>(Instant.parse("2026-11-01T00:00:00Z"));
		Clock moving = new Clock() {
			@Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
			@Override public Clock withZone(java.time.ZoneId zone) { return this; }
			@Override public Instant instant() { return now.get(); }
		};
		FlightAgent timed = new FlightAgent(flights, moving);
		when(flights.search(any())).thenThrow(restricted());
		timed.find(journey, brief, 4000);
		verify(flights, times(2)).search(any());

		now.set(Instant.parse("2026-11-01T02:00:00Z"));
		timed.find(journey, brief, 4000);

		verify(flights, times(4)).search(any());
	}
}
