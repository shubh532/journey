package com.journey.backend.agent;

import com.journey.backend.gemini.GeminiClient;
import com.journey.backend.gemini.GeminiOptions;
import com.journey.backend.journey.Journey;
import com.journey.backend.logging.LogText;
import java.time.Duration;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Turns the trip form into a brief: airports, areas to cover and a theme for each day. */
@Component
public class PlannerAgent {

	private static final Logger log = LoggerFactory.getLogger(PlannerAgent.class);
	private static final Pattern IATA = Pattern.compile("[A-Z]{3}");
	private static final GeminiOptions OPTIONS = GeminiOptions.structured(Duration.ofSeconds(20), 2048);

	private final GeminiClient gemini;

	public PlannerAgent(GeminiClient gemini) {
		this.gemini = gemini;
	}

	/** Never throws; returns an empty brief when the planner cannot run. */
	public TripBrief plan(Journey journey, int days) {
		long start = System.nanoTime();
		log.info("Planner agent: start {} -> {}, {} days", journey.getOrigin(), journey.getDestination(), days);
		String prompt = """
				You are a travel planner. Reply with JSON only, in this shape:
				{"originCode":"3-letter IATA code of the main airport serving the origin, or null",
				 "destinationCode":"3-letter IATA code of the main airport serving the destination, or null",
				 "areas":["3-5 distinct neighbourhoods or areas worth covering in the destination"],
				 "dayThemes":["exactly %d short themes, one per day, in order"]}

				Trip: %s to %s, %d days, %d travellers (%s), %s style, interests: %s.
				""".formatted(days, journey.getOrigin(), journey.getDestination(), days, journey.getTravelers(),
				journey.getTripType().name().toLowerCase(), journey.getTravelStyle().label(),
				String.join(", ", journey.getInterests()));
		try {
			TripBrief raw = AgentJson.parse(gemini.generateJson(prompt, OPTIONS), TripBrief.class);
			TripBrief brief = new TripBrief(validCode(raw.originCode()), validCode(raw.destinationCode()),
					raw.areas(), raw.dayThemes());
			if (brief.originCode() == null || brief.destinationCode() == null) {
				log.warn("Planner agent: unusable airport codes (origin={}, destination={}), flights will be skipped",
						raw.originCode(), raw.destinationCode());
			}
			if (brief.dayThemes().size() != days) {
				log.warn("Planner agent: expected {} day themes but got {}", days, brief.dayThemes().size());
			}
			log.info("Planner agent: done in {} ms, origin={} destination={} areas={} themes={}",
					LogText.elapsedMs(start), brief.originCode(), brief.destinationCode(), brief.areas().size(),
					brief.dayThemes().size());
			log.debug("Planner agent: brief {}", AgentJson.toJson(brief));
			return brief;
		}
		catch (RuntimeException e) {
			log.warn("FALLBACK: Planner agent failed after {} ms, continuing without a brief: {}", LogText.elapsedMs(start),
					e.toString());
			log.debug("Planner agent: failure detail", e);
			return TripBrief.empty();
		}
	}

	private static String validCode(String code) {
		if (code == null) {
			return null;
		}
		String upper = code.trim().toUpperCase();
		return IATA.matcher(upper).matches() ? upper : null;
	}
}
