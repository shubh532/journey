package com.journey.backend.agent;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.journey.backend.gemini.GeminiClient;
import com.journey.backend.gemini.GeminiOptions;
import com.journey.backend.journey.Journey;
import com.journey.backend.logging.LogText;
import com.journey.backend.tavily.TavilyService;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Finds real places for the destination: Tavily gathers web results (two searches in parallel), Gemini
 * distils them into structured places. Only places that cite one of the retrieved pages are kept.
 */
@Component
public class ResearchAgent {

	private static final Logger log = LoggerFactory.getLogger(ResearchAgent.class);
	private static final int RESULTS_PER_QUERY = 4;
	private static final int SNIPPET_LENGTH = 400;
	private static final int MAX_PAGES = 8;
	private static final GeminiOptions EXTRACTION = GeminiOptions.structured(Duration.ofSeconds(45), 4096);
	private static final List<String> FOOD_WORDS = List.of("food", "restaurant", "cafe", "café", "bakery", "dhaba",
			"eatery", "dining", "kitchen");

	private final TavilyService tavily;
	private final GeminiClient gemini;
	private final AgentExecutor executor;

	public ResearchAgent(TavilyService tavily, GeminiClient gemini, AgentExecutor executor) {
		this.tavily = tavily;
		this.gemini = gemini;
		this.executor = executor;
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Places(List<ResearchPlace> places) {

	}

	/** Never throws; returns no places when research is unavailable. */
	public List<ResearchPlace> research(Journey journey) {
		long start = System.nanoTime();
		String destination = journey.getDestination();
		String interests = String.join(", ", journey.getInterests());
		log.info("Research agent: start destination={} interests=[{}]", destination, interests);

		List<String> queries = List.of("best things to do in " + destination + " for " + interests,
				"best local restaurants and food in " + destination);
		List<CompletableFuture<Map<String, String>>> searches = queries.stream()
				.map(query -> executor.supply(() -> collect(query)))
				.toList();
		Map<String, String> pages = new LinkedHashMap<>();
		for (int i = 0; i < queries.size(); i++) {
			try {
				searches.get(i).join().forEach((url, text) -> {
					if (pages.size() < MAX_PAGES) {
						pages.putIfAbsent(url, text);
					}
				});
			}
			catch (CompletionException e) {
				log.warn("Research agent: search '{}' failed: {}", queries.get(i), e.getCause());
			}
		}
		if (pages.isEmpty()) {
			log.warn("FALLBACK: Research agent collected no web pages in {} ms, returning no places",
					LogText.elapsedMs(start));
			return List.of();
		}
		List<ResearchPlace> places = extract(destination, pages);
		log.info("Research agent: done in {} ms, {} pages -> {} places", LogText.elapsedMs(start), pages.size(),
				places.size());
		return places;
	}

	private Map<String, String> collect(String query) {
		Map<String, String> pages = new LinkedHashMap<>();
		Map<String, Object> response = tavily.search(query, RESULTS_PER_QUERY);
		if (response == null || !(response.get("results") instanceof List<?> results)) {
			log.warn("Research agent: Tavily response had no results list for '{}'", query);
			return pages;
		}
		for (Object result : results) {
			if (result instanceof Map<?, ?> r && r.get("url") instanceof String url
					&& r.get("content") instanceof String content) {
				String title = r.get("title") instanceof String t ? t : url;
				pages.putIfAbsent(url, title + ": " + truncate(content, SNIPPET_LENGTH));
			}
			else {
				log.debug("Research agent: skipped a result without url/content: {}", LogText.truncate(result));
			}
		}
		log.info("Research agent: '{}' -> {} results, {} usable pages", query, results.size(), pages.size());
		return pages;
	}

	private List<ResearchPlace> extract(String destination, Map<String, String> pages) {
		StringBuilder sources = new StringBuilder();
		pages.forEach((url, text) -> sources.append("- ").append(url).append("\n  ").append(text).append('\n'));
		String prompt = """
				From the web results below, list up to 12 real, specific places or experiences in %s
				that a traveller could visit (named attractions, restaurants, cafes, markets, viewpoints).
				Use only what the results support. Every place needs a specific proper name, never a generic
				one like "hot springs" or "old town". "kind" must be exactly "activity" or "food".
				Reply with JSON only:
				{"places":[{"name":"","kind":"activity or food","area":"neighbourhood",
				"description":"one sentence","sourceUrl":"the exact URL it came from"}]}

				Results:
				%s""".formatted(destination, sources);
		log.debug("Research agent: extracting places from {} pages: {}", pages.size(), pages.keySet());
		try {
			Places parsed = AgentJson.parse(gemini.generateJson(prompt, EXTRACTION), Places.class);
			if (parsed == null || parsed.places() == null) {
				log.warn("FALLBACK: Research agent extraction returned no places list");
				return List.of();
			}
			List<ResearchPlace> kept = new ArrayList<>();
			for (ResearchPlace place : parsed.places()) {
				String rejection = rejection(place, pages);
				if (rejection == null) {
					kept.add(new ResearchPlace(place.name().trim(), normalizeKind(place.kind()), place.area(),
							place.description(), place.sourceUrl()));
				}
				else {
					log.debug("Research agent: dropped '{}': {}", place.name(), rejection);
				}
			}
			log.info("Research agent: extraction proposed {} places, kept {}", parsed.places().size(), kept.size());
			log.debug("Research agent: places {}", AgentJson.toJson(kept));
			return kept;
		}
		catch (RuntimeException e) {
			log.warn("FALLBACK: Research agent extraction failed: {}", e.toString());
			log.debug("Research agent: extraction failure detail", e);
			return List.of();
		}
	}

	/** Why a place is not usable, or null when it is. */
	private static String rejection(ResearchPlace place, Map<String, String> pages) {
		if (place.name() == null || place.name().isBlank()) {
			return "no name";
		}
		String name = place.name().trim();
		if (name.length() < 3) {
			return "name too short";
		}
		if (place.area() != null && name.equalsIgnoreCase(place.area().trim())) {
			return "name is just the area, not a specific place";
		}
		if (!pages.containsKey(place.sourceUrl())) {
			return "sourceUrl is not among the retrieved pages (" + place.sourceUrl() + ")";
		}
		return null;
	}

	/** The model is asked for activity or food but returns things like "Temple" or "Cafe / Bakery". */
	static String normalizeKind(String kind) {
		String lower = kind == null ? "" : kind.toLowerCase(Locale.ROOT);
		return FOOD_WORDS.stream().anyMatch(lower::contains) ? "food" : "activity";
	}

	private static String truncate(String text, int max) {
		return text.length() <= max ? text : text.substring(0, max);
	}
}
