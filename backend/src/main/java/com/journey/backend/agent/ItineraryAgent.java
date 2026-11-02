package com.journey.backend.agent;

import com.journey.backend.gemini.GeminiClient;
import com.journey.backend.gemini.GeminiOptions;
import com.journey.backend.journey.GeneratedPlan;
import com.journey.backend.journey.Journey;
import com.journey.backend.logging.LogText;
import java.time.Duration;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Writes the day-by-day schedule from the brief, the researched places and the booked flight and stay. */
@Component
public class ItineraryAgent {

	private static final Logger log = LoggerFactory.getLogger(ItineraryAgent.class);
	private static final GeminiOptions OPTIONS = GeminiOptions.structured(Duration.ofSeconds(75), 8192);

	private final GeminiClient gemini;

	public ItineraryAgent(GeminiClient gemini) {
		this.gemini = gemini;
	}

	/** Returns null when the agent cannot produce a draft. {@code feedback} lists the critic's issues on a retry. */
	public ItineraryDraft draft(Journey journey, int days, TripBrief brief, List<ResearchPlace> places,
			GeneratedPlan plan, List<String> feedback) {
		long start = System.nanoTime();
		log.info("Itinerary agent: start {} days, {} places, flight arrives {}, stay '{}', {}", days, places.size(),
				plan.flight().arrival(), plan.stay().name(),
				feedback.isEmpty() ? "first attempt" : "retry with " + feedback.size() + " issues");
		if (!feedback.isEmpty()) {
			log.debug("Itinerary agent: critic feedback {}", feedback);
		}
		GeneratedPlan.Flight flight = plan.flight();
		GeneratedPlan.Stay stay = plan.stay();
		String prompt = """
				You are a travel itinerary writer. Build a %d-day itinerary for %s, starting from %s.
				Travellers: %d (%s). Style: %s. Interests: %s.

				Day themes: %s
				Areas to cover: %s
				Real places you should prefer (set sourceUrl to the place's sourceUrl when you use one):
				%s

				Fixed facts:
				- Day 1 begins with a "travel" item for arriving in %s at %s (24-hour clock).
				- Hotel: %s, in %s. Day 1 includes the check-in as a "stay" item.
				- The last day ends with a "travel" item for departing home.

				Rules:
				- 4 to 6 items per day, in time order, using "HH:mm" 24-hour times.
				- kind must be one of: travel, stay, food, activity.
				- Group nearby places on the same day. Keep days realistic, not packed.
				- Do not mention prices or costs anywhere.
				- If an interest is not realistically available at the destination (for example beaches in a hill
				  town), replace it with the closest local equivalent instead of inventing it.
				- "summary" is two sentences about the trip, under 300 characters.
				%s
				Reply with JSON only:
				{"summary":"","items":[{"day":1,"time":"09:30","kind":"activity","title":"","place":"",
				"description":"one sentence","sourceUrl":null}]}
				""".formatted(days, journey.getDestination(), journey.getOrigin(), journey.getTravelers(),
				journey.getTripType().name().toLowerCase(), journey.getTravelStyle().label(),
				String.join(", ", journey.getInterests()), brief.dayThemes(), brief.areas(),
				places.isEmpty() ? "(none found; use well-known places)" : AgentJson.toJson(places),
				journey.getDestination(), flight.arrival(), stay.name(), stay.area(), feedbackBlock(feedback));
		try {
			ItineraryDraft draft = AgentJson.parse(gemini.generateJson(prompt, OPTIONS), ItineraryDraft.class);
			log.info("Itinerary agent: done in {} ms, {} items, summary {} chars", LogText.elapsedMs(start),
					draft.items() == null ? 0 : draft.items().size(),
					draft.summary() == null ? 0 : draft.summary().length());
			log.debug("Itinerary agent: draft {}", AgentJson.toJson(draft));
			return draft;
		}
		catch (RuntimeException e) {
			log.warn("FALLBACK: Itinerary agent failed after {} ms: {}", LogText.elapsedMs(start), e.toString());
			log.debug("Itinerary agent: failure detail", e);
			return null;
		}
	}

	private static String feedbackBlock(List<String> feedback) {
		return feedback.isEmpty() ? ""
				: "- Your previous draft had these problems, fix them: " + String.join("; ", feedback);
	}
}
