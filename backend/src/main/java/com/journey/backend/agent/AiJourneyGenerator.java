package com.journey.backend.agent;

import com.journey.backend.journey.GeneratedJourney;
import com.journey.backend.journey.GeneratedPlan;
import com.journey.backend.journey.GenerationReport;
import com.journey.backend.journey.GenerationReport.Status;
import com.journey.backend.journey.ItineraryItem;
import com.journey.backend.journey.Journey;
import com.journey.backend.journey.JourneyGenerator;
import com.journey.backend.journey.MockJourneyGenerator;
import com.journey.backend.logging.LogText;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Orchestrates the agents: planner, then research and flight in parallel, then itinerary, checked by
 * the critic. The mock generator supplies the baseline (stay, costs, budget), so every agent that
 * fails degrades to the mock's answer for its part and generation always returns a journey.
 * Money is never produced here: costs come from the budget engine via the baseline.
 * Every run ends with one PIPELINE SUMMARY log block, and the same facts are attached to the plan as a
 * {@link GenerationReport} so the traveller can see how the plan was built.
 */
@Component
@Primary
@ConditionalOnProperty(name = "journey.generator", havingValue = "ai", matchIfMissing = true)
public class AiJourneyGenerator implements JourneyGenerator {

	private static final Logger log = LoggerFactory.getLogger(AiJourneyGenerator.class);
	private static final int SUMMARY_LENGTH = 1000;
	/** Logging context key; every line of one generation carries it, including the parallel agents. */
	private static final String RUN_KEY = "run";
	/** Upper bounds on waiting for the parallel steps, on top of each call's own timeout. */
	private static final long RESEARCH_WAIT_SECONDS = 70;
	private static final long FLIGHT_WAIT_SECONDS = 30;
	/** After this long a content retry is not worth starting, the caller is already waiting too long. */
	private static final long NO_RETRY_AFTER_MS = 100_000;

	private static final String PLANNER = "planner";
	private static final String RESEARCH = "research";
	private static final String FLIGHT = "flight";
	private static final String ITINERARY = "itinerary";

	private final MockJourneyGenerator baseline;
	private final PlannerAgent planner;
	private final ResearchAgent researcher;
	private final FlightAgent flightAgent;
	private final ItineraryAgent itineraryAgent;
	private final ItineraryCritic critic;
	private final AgentExecutor executor;

	public AiJourneyGenerator(MockJourneyGenerator baseline, PlannerAgent planner, ResearchAgent researcher,
			FlightAgent flightAgent, ItineraryAgent itineraryAgent, ItineraryCritic critic, AgentExecutor executor) {
		this.baseline = baseline;
		this.planner = planner;
		this.researcher = researcher;
		this.flightAgent = flightAgent;
		this.itineraryAgent = itineraryAgent;
		this.critic = critic;
		this.executor = executor;
	}

	/** What each step contributed to one run. Steps default to "not completed" until a result is recorded. */
	private static final class Report {

		private static final Map<String, String> LABELS = Map.of(
				PLANNER, "Understanding your trip",
				RESEARCH, "Researching places",
				FLIGHT, "Finding flights",
				ITINERARY, "Building your itinerary");

		private final Map<String, GenerationReport.Step> steps = new LinkedHashMap<>();
		/** Note about the quality-check retry, for the server log only. */
		String retry = "none";

		Report() {
			for (String id : List.of(PLANNER, RESEARCH, FLIGHT, ITINERARY)) {
				record(id, Status.FALLBACK, "Not completed", 0);
			}
		}

		void record(String id, Status status, String detail, long durationMs) {
			steps.put(id, new GenerationReport.Step(id, LABELS.get(id), status, detail, durationMs));
		}

		GenerationReport build(String runId, long totalMs) {
			return new GenerationReport(runId, totalMs, List.copyOf(steps.values()));
		}
	}

	@Override
	public GeneratedJourney generate(Journey journey) {
		String run = UUID.randomUUID().toString().substring(0, 8);
		MDC.put(RUN_KEY, run);
		long start = System.nanoTime();
		Report report = new Report();
		try {
			log.info("Pipeline: start journey={} {} -> {}, {} to {}, {} travellers ({}), budget {}, {} style, interests {}",
					journey.getId(), journey.getOrigin(), journey.getDestination(), journey.getStartDate(),
					journey.getEndDate(), journey.getTravelers(), journey.getTripType(), journey.getBudget(),
					journey.getTravelStyle(), journey.getInterests());
			GeneratedJourney base = baseline.generate(journey);
			log.info("Pipeline: baseline ready, estimatedCost={} items={}", base.estimatedCost(), base.items().size());
			GeneratedJourney result;
			try {
				result = orchestrate(journey, base, report, start);
			}
			catch (RuntimeException e) {
				log.warn("FALLBACK: Pipeline agents failed, using the baseline journey: {}", e.toString());
				log.debug("Pipeline: failure detail", e);
				report.record(ITINERARY, Status.FALLBACK, "Used a standard itinerary template", 0);
				result = base;
			}
			log.info("Pipeline: finished in {} ms, {} itinerary items, summary: {}", LogText.elapsedMs(start),
					result.items().size(), result.summary());
			logSummary(run, report, start);
			GenerationReport finished = report.build(run, LogText.elapsedMs(start));
			return new GeneratedJourney(result.summary(), result.estimatedCost(),
					result.plan().withReport(finished), result.items());
		}
		finally {
			MDC.remove(RUN_KEY);
		}
	}

	private GeneratedJourney orchestrate(Journey journey, GeneratedJourney base, Report report, long start) {
		int days = (int) ChronoUnit.DAYS.between(journey.getStartDate(), journey.getEndDate()) + 1;

		log.info("Pipeline: step 1/4 planner");
		long plannerStart = System.nanoTime();
		TripBrief brief = planner.plan(journey, days);
		long plannerMs = LogText.elapsedMs(plannerStart);
		boolean usableBrief = !brief.areas().isEmpty() || brief.originCode() != null;
		if (usableBrief) {
			String airports = brief.originCode() != null && brief.destinationCode() != null
					? "Airports matched (" + brief.originCode() + " to " + brief.destinationCode() + "), "
					: "";
			report.record(PLANNER, Status.OK, airports + brief.areas().size() + " areas to explore", plannerMs);
		}
		else {
			report.record(PLANNER, Status.FALLBACK, "Used standard planning, flights could not be searched", plannerMs);
		}

		log.info("Pipeline: step 2/4 research and flight in parallel");
		long parallelStart = System.nanoTime();
		AtomicLong researchMs = new AtomicLong();
		AtomicLong flightMs = new AtomicLong();
		CompletableFuture<List<ResearchPlace>> research = executor.supply(() -> {
			long begin = System.nanoTime();
			try {
				return researcher.research(journey);
			}
			finally {
				researchMs.set(LogText.elapsedMs(begin));
			}
		});
		CompletableFuture<Optional<GeneratedPlan.Flight>> flight = executor.supply(() -> {
			long begin = System.nanoTime();
			try {
				return flightAgent.find(journey, brief, base.plan().flight().pricePerPerson());
			}
			finally {
				flightMs.set(LogText.elapsedMs(begin));
			}
		});

		List<ResearchPlace> places = await(research, RESEARCH_WAIT_SECONDS, "research", List.of());
		Optional<GeneratedPlan.Flight> realFlight = await(flight, FLIGHT_WAIT_SECONDS, "flight", Optional.empty());
		GeneratedPlan plan = realFlight
				.map(f -> new GeneratedPlan(f, base.plan().stay(), base.plan().budgetBreakdown()))
				.orElse(base.plan());
		if (places.isEmpty()) {
			report.record(RESEARCH, Status.FALLBACK, "No places found online, used well-known highlights",
					researchMs.get());
		}
		else {
			report.record(RESEARCH, Status.OK, places.size() + " places found from web research", researchMs.get());
		}
		if (realFlight.isPresent()) {
			GeneratedPlan.Flight f = realFlight.get();
			report.record(FLIGHT, Status.OK, "Found " + f.airline() + " " + f.departure() + " to " + f.arrival()
					+ ", price is an estimate", flightMs.get());
		}
		else {
			report.record(FLIGHT, Status.FALLBACK, "Live schedule unavailable, showing an estimated flight",
					flightMs.get());
		}
		log.info("Pipeline: parallel steps done in {} ms", LogText.elapsedMs(parallelStart));

		log.info("Pipeline: step 3/4 itinerary");
		long itineraryStart = System.nanoTime();
		ItineraryDraft draft = itineraryAgent.draft(journey, days, brief, places, plan, List.of());

		log.info("Pipeline: step 4/4 critic");
		List<String> issues = critic.review(draft, days);
		if (draft == null) {
			// The agent failed (timeout, transport, unparseable reply). Repeating the same prompt with a
			// feedback line cannot fix that, so there is no retry.
			log.warn("FALLBACK: Pipeline got no itinerary draft, not retrying an identical request");
			report.record(ITINERARY, Status.FALLBACK, "Used a standard itinerary template",
					LogText.elapsedMs(itineraryStart));
			return new GeneratedJourney(base.summary(), base.estimatedCost(), plan, base.items());
		}
		boolean retried = false;
		if (!issues.isEmpty()) {
			if (LogText.elapsedMs(start) > NO_RETRY_AFTER_MS) {
				log.warn("Pipeline: critic found {} issues but {} ms have passed, skipping the retry", issues.size(),
						LogText.elapsedMs(start));
				report.retry = "skipped (took too long)";
			}
			else {
				log.info("Pipeline: critic sent the itinerary back with {} issues, retrying once", issues.size());
				ItineraryDraft retry = itineraryAgent.draft(journey, days, brief, places, plan, issues);
				if (retry != null) {
					draft = retry;
					retried = true;
					report.retry = "used, " + critic.review(draft, days).size() + " issues remain";
				}
				else {
					log.warn("Pipeline: retry produced no draft, keeping the first one");
					report.retry = "failed, kept the first draft";
				}
			}
		}

		List<ItineraryItem> items = critic.toItems(draft, days, journey.getId());
		long itineraryMs = LogText.elapsedMs(itineraryStart);
		if (!critic.coversEveryDay(items, days)) {
			log.warn("FALLBACK: Pipeline itinerary still failed review ({} usable items), keeping the baseline",
					items.size());
			report.record(ITINERARY, Status.FALLBACK, "Used a standard itinerary template", itineraryMs);
			return new GeneratedJourney(base.summary(), base.estimatedCost(), plan, base.items());
		}
		String summary = draft.summary() == null || draft.summary().isBlank() ? base.summary()
				: cut(draft.summary().trim(), SUMMARY_LENGTH);
		long sourced = items.stream().filter(item -> item.getSourceUrl() != null).count();
		log.info("Pipeline: using the agent itinerary ({} items, {} with sources)", items.size(), sourced);
		report.record(ITINERARY, Status.OK, items.size() + " activities planned"
				+ (sourced > 0 ? ", " + sourced + " with web sources" : "")
				+ (retried ? ", refined after a quality check" : ""), itineraryMs);
		return new GeneratedJourney(summary, base.estimatedCost(), plan, items);
	}

	/** Waits for a parallel step, falling back (and saying so) when it fails or takes too long. */
	private static <T> T await(CompletableFuture<T> future, long seconds, String step, T fallback) {
		try {
			return future.get(seconds, TimeUnit.SECONDS);
		}
		catch (TimeoutException e) {
			future.cancel(true);
			log.warn("FALLBACK: Pipeline gave up waiting for {} after {} s", step, seconds);
		}
		catch (ExecutionException e) {
			log.warn("FALLBACK: Pipeline {} step failed: {}", step, String.valueOf(e.getCause()));
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			log.warn("FALLBACK: Pipeline was interrupted while waiting for {}", step);
		}
		return fallback;
	}

	private static void logSummary(String run, Report report, long start) {
		StringBuilder lines = new StringBuilder();
		report.steps.values().forEach(step -> lines.append(String.format("%-10s: %s %s (%d ms)%n", step.id(),
				step.status(), step.detail(), step.durationMs())));
		log.info("""

				============ PIPELINE SUMMARY run={} ============
				{}retry     : {}
				total     : {} ms
				=================================================""", run, lines, report.retry,
				LogText.elapsedMs(start));
	}

	private static String cut(String value, int max) {
		return value.length() <= max ? value : value.substring(0, max);
	}
}
