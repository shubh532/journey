package com.journey.backend.agent;

import static org.assertj.core.api.Assertions.assertThat;

import com.journey.backend.journey.ItemKind;
import com.journey.backend.journey.ItineraryItem;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ItineraryCriticTest {

	private final ItineraryCritic critic = new ItineraryCritic();

	private static ItineraryDraft.Item item(int day, String time, String kind, String title) {
		return new ItineraryDraft.Item(day, time, kind, title, "Somewhere", "A description", null);
	}

	private static ItineraryDraft draft(ItineraryDraft.Item... items) {
		return new ItineraryDraft("Summary", List.of(items));
	}

	@Test
	void acceptsADraftThatCoversEveryDay() {
		ItineraryDraft draft = draft(item(1, "09:00", "travel", "Arrive"), item(1, "13:00", "food", "Lunch"),
				item(2, "9:30", "activity", "Beach"), item(2, "20:00", "food", "Dinner"));

		assertThat(critic.review(draft, 2)).isEmpty();
	}

	@Test
	void reportsEmptyAndMissingDraft() {
		assertThat(critic.review(null, 2)).containsExactly("The itinerary has no items");
		assertThat(critic.review(new ItineraryDraft("s", List.of()), 2)).hasSize(1);
	}

	@Test
	void reportsInvalidDayTimeAndKind() {
		ItineraryDraft draft = draft(item(9, "09:00", "food", "Late"), item(1, "25:00", "food", "Bad time"),
				item(1, "10:00", "party", "Bad kind"));

		List<String> issues = critic.review(draft, 2);

		assertThat(issues).anyMatch(i -> i.contains("outside the trip"));
		assertThat(issues).anyMatch(i -> i.contains("invalid time"));
		assertThat(issues).anyMatch(i -> i.contains("invalid kind"));
		assertThat(issues).anyMatch(i -> i.startsWith("Day 2"));
	}

	@Test
	void convertsValidItemsInScheduleOrderAndDropsInvalidOnes() {
		UUID journeyId = UUID.randomUUID();
		ItineraryDraft draft = draft(item(2, "10:00", "activity", "Second day"), item(1, "18:00", "FOOD", "Dinner"),
				item(1, "8:05", "travel", "Arrive"), item(1, "99:99", "food", "Dropped"));

		List<ItineraryItem> items = critic.toItems(draft, 2, journeyId);

		assertThat(items).extracting(ItineraryItem::getTitle).containsExactly("Arrive", "Dinner", "Second day");
		assertThat(items.get(0).getStartMinutes()).isEqualTo(8 * 60 + 5);
		assertThat(items.get(1).getKind()).isEqualTo(ItemKind.FOOD);
		assertThat(items).allMatch(i -> i.getJourneyId().equals(journeyId));
	}

	@Test
	void coverageNeedsMinimumItemsOnEveryDay() {
		UUID id = UUID.randomUUID();
		List<ItineraryItem> full = critic.toItems(draft(item(1, "09:00", "food", "a"), item(1, "12:00", "food", "b"),
				item(2, "09:00", "food", "c"), item(2, "12:00", "food", "d")), 2, id);
		List<ItineraryItem> thin = critic.toItems(draft(item(1, "09:00", "food", "a"), item(1, "12:00", "food", "b"),
				item(2, "09:00", "food", "c")), 2, id);

		assertThat(critic.coversEveryDay(full, 2)).isTrue();
		assertThat(critic.coversEveryDay(thin, 2)).isFalse();
	}
}
