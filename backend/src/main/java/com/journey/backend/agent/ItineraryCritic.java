package com.journey.backend.agent;

import com.journey.backend.journey.ItemKind;
import com.journey.backend.journey.ItemOrigin;
import com.journey.backend.journey.ItineraryItem;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Checks an itinerary draft against rules that must always hold. Deliberately plain code rather than
 * another LLM call: these checks are cheap, repeatable and cannot be talked out of a failure.
 */
@Component
public class ItineraryCritic {

	private static final Logger log = LoggerFactory.getLogger(ItineraryCritic.class);
	private static final Pattern CLOCK = Pattern.compile("(\\d{1,2}):(\\d{2})");
	private static final int MIN_ITEMS_PER_DAY = 2;

	/** Problems found in the draft, empty when it is acceptable. */
	public List<String> review(ItineraryDraft draft, int days) {
		List<String> issues = new ArrayList<>();
		if (draft == null || draft.items() == null || draft.items().isEmpty()) {
			issues.add("The itinerary has no items");
			log.info("Critic: draft is missing or has no items");
			return issues;
		}
		int[] perDay = new int[days + 1];
		for (ItineraryDraft.Item item : draft.items()) {
			String problem = problem(item, days);
			if (problem != null) {
				issues.add(problem);
			}
			else {
				perDay[item.day()]++;
			}
		}
		for (int day = 1; day <= days; day++) {
			if (perDay[day] < MIN_ITEMS_PER_DAY) {
				issues.add("Day " + day + " needs at least " + MIN_ITEMS_PER_DAY + " valid items");
			}
		}
		log.info("Critic: reviewed {} items over {} days, {} issues", draft.items().size(), days, issues.size());
		if (!issues.isEmpty()) {
			log.info("Critic: issues {}", issues);
		}
		return issues;
	}

	/** Converts the valid items of a draft into entities, dropping any that fail the checks, in schedule order. */
	public List<ItineraryItem> toItems(ItineraryDraft draft, int days, UUID journeyId) {
		if (draft == null || draft.items() == null) {
			return List.of();
		}
		List<ItineraryItem> items = convert(draft, days, journeyId);
		log.info("Critic: kept {} of {} draft items", items.size(), draft.items().size());
		return items;
	}

	private List<ItineraryItem> convert(ItineraryDraft draft, int days, UUID journeyId) {
		return draft.items().stream()
				.filter(item -> {
					String problem = problem(item, days);
					if (problem != null) {
						log.debug("Critic: dropped item, {}", problem);
					}
					return problem == null;
				})
				.map(item -> new ItineraryItem(journeyId, item.day(), minutes(item.time()), kind(item.kind()),
						cut(item.title().trim(), 255), cut(blankToNull(item.place()), 255),
						cut(blankToNull(item.description()), 1000), cut(blankToNull(item.sourceUrl()), 1000),
						ItemOrigin.AI))
				.sorted(Comparator.comparingInt(ItineraryItem::getDay).thenComparingInt(ItineraryItem::getStartMinutes))
				.toList();
	}

	/** True when every day of the trip has the minimum number of items. */
	public boolean coversEveryDay(List<ItineraryItem> items, int days) {
		int[] perDay = new int[days + 1];
		items.forEach(item -> perDay[item.getDay()]++);
		for (int day = 1; day <= days; day++) {
			if (perDay[day] < MIN_ITEMS_PER_DAY) {
				return false;
			}
		}
		return true;
	}

	private static String problem(ItineraryDraft.Item item, int days) {
		String label = item.title() == null ? "An item" : "'" + item.title() + "'";
		if (item.title() == null || item.title().isBlank()) {
			return "An item has no title";
		}
		if (item.day() < 1 || item.day() > days) {
			return label + " is on day " + item.day() + ", outside the trip (1 to " + days + ")";
		}
		if (minutes(item.time()) < 0) {
			return label + " has an invalid time '" + item.time() + "', use HH:mm";
		}
		if (kind(item.kind()) == null) {
			return label + " has an invalid kind '" + item.kind() + "', use travel, stay, food or activity";
		}
		return null;
	}

	private static int minutes(String time) {
		if (time == null) {
			return -1;
		}
		Matcher m = CLOCK.matcher(time.trim());
		if (!m.matches()) {
			return -1;
		}
		int hours = Integer.parseInt(m.group(1));
		int mins = Integer.parseInt(m.group(2));
		return hours > 23 || mins > 59 ? -1 : hours * 60 + mins;
	}

	private static ItemKind kind(String kind) {
		if (kind == null) {
			return null;
		}
		try {
			return ItemKind.valueOf(kind.trim().toUpperCase(Locale.ROOT));
		}
		catch (IllegalArgumentException e) {
			return null;
		}
	}

	private static String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private static String cut(String value, int max) {
		return value == null || value.length() <= max ? value : value.substring(0, max);
	}
}
