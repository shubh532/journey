package com.journey.backend.agent;

import com.journey.backend.exception.ApiException;
import com.journey.backend.flight.AviationStackClient;
import com.journey.backend.flight.FlightResult;
import com.journey.backend.flight.FlightSearchRequest;
import com.journey.backend.flight.FlightService;
import com.journey.backend.journey.GeneratedPlan;
import com.journey.backend.journey.Journey;
import com.journey.backend.logging.LogText;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Looks up real scheduled flights on the route. AviationStack provides schedules but no fares, so
 * the price is passed in from the budget engine and stays ESTIMATED.
 */
@Component
public class FlightAgent {

	private static final Logger log = LoggerFactory.getLogger(FlightAgent.class);
	private static final DateTimeFormatter CLOCK = DateTimeFormatter.ofPattern("HH:mm");
	private static final int LIMIT = 10;

	/** How long to stop calling the provider after it said our plan does not allow a request. */
	private static final Duration RESTRICTED_COOLDOWN = Duration.ofMinutes(60);

	private final FlightService flights;
	private final Clock clock;
	private volatile Instant skipDatedSearchUntil = Instant.MIN;
	private volatile Instant skipAllSearchesUntil = Instant.MIN;

	@Autowired
	public FlightAgent(FlightService flights) {
		this(flights, Clock.systemUTC());
	}

	FlightAgent(FlightService flights, Clock clock) {
		this.flights = flights;
		this.clock = clock;
	}

	/** Never throws; empty when no usable flight is found or the provider is unavailable. */
	public Optional<GeneratedPlan.Flight> find(Journey journey, TripBrief brief, long estimatedPricePerPerson) {
		long start = System.nanoTime();
		if (brief.originCode() == null || brief.destinationCode() == null) {
			log.info("Flight agent: skipped, no airport codes (origin={}, destination={})", brief.originCode(),
					brief.destinationCode());
			return Optional.empty();
		}
		if (clock.instant().isBefore(skipAllSearchesUntil)) {
			log.info("Flight agent: skipped, the provider plan rejected flight searches, retrying after {}",
					skipAllSearchesUntil);
			return Optional.empty();
		}
		log.info("Flight agent: start {} -> {} on {}", brief.originCode(), brief.destinationCode(),
				journey.getStartDate());
		try {
			// Free plans often reject the date filter, so a dated search that fails or is empty falls back to an
			// open search (the provider's current schedule for the route).
			List<FlightResult> results = searchWithDate(brief, journey);
			boolean undated = false;
			if (results.isEmpty()) {
				log.info("Flight agent: searching without a date filter");
				results = searchWithoutDate(brief);
				undated = true;
				log.info("Flight agent: {} flights without a date", results.size());
			}
			Optional<GeneratedPlan.Flight> flight = results.stream()
					.map(r -> toFlight(r, journey, estimatedPricePerPerson))
					.flatMap(Optional::stream)
					.findFirst();
			if (flight.isPresent()) {
				log.info("Flight agent: done in {} ms, chose {}", LogText.elapsedMs(start), flight.get());
				if (undated) {
					log.warn("Flight agent: that schedule is not for {}, so the times are indicative only",
							journey.getStartDate());
				}
			}
			else {
				log.warn("FALLBACK: Flight agent found no usable flight among {} in {} ms, keeping the estimated flight",
						results.size(), LogText.elapsedMs(start));
			}
			return flight;
		}
		catch (RuntimeException e) {
			log.warn("FALLBACK: Flight agent failed after {} ms, keeping the estimated flight: {}",
					LogText.elapsedMs(start), e.toString());
			log.debug("Flight agent: failure detail", e);
			return Optional.empty();
		}
	}

	private List<FlightResult> searchWithDate(TripBrief brief, Journey journey) {
		if (clock.instant().isBefore(skipDatedSearchUntil)) {
			log.info("Flight agent: not using the date filter, the plan rejected it (until {})", skipDatedSearchUntil);
			return List.of();
		}
		try {
			List<FlightResult> results = flights.search(new FlightSearchRequest(brief.originCode(),
					brief.destinationCode(), journey.getStartDate().toString(), LIMIT));
			log.info("Flight agent: {} flights for {}", results.size(), journey.getStartDate());
			return results;
		}
		catch (ApiException e) {
			if (AviationStackClient.PLAN_RESTRICTED.equals(e.getCode())) {
				skipDatedSearchUntil = clock.instant().plus(RESTRICTED_COOLDOWN);
				log.warn("Flight agent: the provider plan does not allow the date filter, "
						+ "using open searches for the next {} minutes", RESTRICTED_COOLDOWN.toMinutes());
			}
			else {
				log.warn("Flight agent: dated search failed ({}), trying an open search", e.getMessage());
			}
			return List.of();
		}
	}

	private List<FlightResult> searchWithoutDate(TripBrief brief) {
		try {
			return flights.search(new FlightSearchRequest(brief.originCode(), brief.destinationCode(), null, LIMIT));
		}
		catch (ApiException e) {
			if (AviationStackClient.PLAN_RESTRICTED.equals(e.getCode())) {
				skipAllSearchesUntil = clock.instant().plus(RESTRICTED_COOLDOWN);
				log.warn("Flight agent: the provider plan rejects flight searches entirely, pausing them for {} minutes",
						RESTRICTED_COOLDOWN.toMinutes());
			}
			throw e;
		}
	}

	private static Optional<GeneratedPlan.Flight> toFlight(FlightResult r, Journey journey, long price) {
		if (r.airline() == null || r.departureTime() == null || r.arrivalTime() == null) {
			log.debug("Flight agent: skipped {} (missing airline or times): {}", r.flightNumber(), r);
			return Optional.empty();
		}
		try {
			OffsetDateTime departure = OffsetDateTime.parse(r.departureTime());
			OffsetDateTime arrival = OffsetDateTime.parse(r.arrivalTime());
			Duration duration = Duration.between(departure, arrival);
			if (duration.isNegative() || duration.isZero()) {
				log.debug("Flight agent: skipped {} (non-positive duration {} -> {})", r.flightNumber(),
						r.departureTime(), r.arrivalTime());
				return Optional.empty();
			}
			return Optional.of(new GeneratedPlan.Flight(r.airline(), journey.getOrigin(), r.departureIata(),
					journey.getDestination(), r.arrivalIata(), CLOCK.format(departure), CLOCK.format(arrival),
					duration.toHours() + "h " + duration.toMinutesPart() + "m", "Non-stop", price, "ESTIMATED"));
		}
		catch (RuntimeException e) {
			log.debug("Flight agent: skipped {} (unparseable times {} / {}): {}", r.flightNumber(),
					r.departureTime(), r.arrivalTime(), e.toString());
			return Optional.empty();
		}
	}
}
