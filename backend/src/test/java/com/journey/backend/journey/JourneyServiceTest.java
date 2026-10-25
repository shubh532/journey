package com.journey.backend.journey;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.journey.backend.budget.BudgetEngine;
import com.journey.backend.exception.ApiException;
import com.journey.backend.journey.dto.CreateItineraryItemRequest;
import com.journey.backend.journey.dto.CreateJourneyRequest;
import com.journey.backend.journey.dto.ItineraryItemResponse;
import com.journey.backend.journey.dto.JourneyResponse;
import com.journey.backend.journey.dto.UpdateJourneyRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class JourneyServiceTest {

	private static final UUID USER = UUID.randomUUID();
	private static final UUID OTHER_USER = UUID.randomUUID();
	private static final UUID JOURNEY_ID = UUID.randomUUID();

	@Mock JourneyRepository journeyRepository;
	@Mock ItineraryItemRepository itemRepository;
	@Spy MockJourneyGenerator generator = new MockJourneyGenerator(new BudgetEngine());
	@InjectMocks JourneyService service;

	private Journey existing;

	@BeforeEach
	void setUp() {
		existing = new Journey(USER, "Goa Journey", "Ahmedabad", "Goa", LocalDate.of(2026, 12, 1),
				LocalDate.of(2026, 12, 5), 2, TripType.COUPLE, new BigDecimal("50000"), TravelStyle.BALANCED,
				List.of("Beaches", "Food"));
	}

	private static CreateJourneyRequest create(LocalDate start, LocalDate end, String title) {
		return new CreateJourneyRequest(" Ahmedabad ", " Goa ", start, end, 2, TripType.COUPLE,
				new BigDecimal("50000"), TravelStyle.BALANCED, List.of(" Beaches ", "Food", "Beaches"), title);
	}

	@Test
	void createTrimsInputDefaultsTitleAndDedupesInterests() {
		stubSaves();

		JourneyResponse response = service.create(USER,
				create(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5), null));

		assertThat(response.title()).isEqualTo("Goa Journey");
		assertThat(response.origin()).isEqualTo("Ahmedabad");
		assertThat(response.destination()).isEqualTo("Goa");
		assertThat(response.interests()).containsExactly("Beaches", "Food");
	}

	@Test
	void createGeneratesCompleteReadyJourney() {
		stubSaves();

		JourneyResponse response = service.create(USER,
				create(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5), null));

		assertThat(response.status()).isEqualTo(JourneyStatus.READY);
		assertThat(response.summary()).contains("beaches and food");
		assertThat(response.estimatedCost()).isPositive();
		assertThat(response.flight().priceSource()).isEqualTo("ESTIMATED");
		assertThat(response.stay().nights()).isEqualTo(4);
		assertThat(response.budgetBreakdown()).hasSize(5);
		assertThat(response.itinerary()).isNotEmpty();
	}

	@Test
	void createRejectsReturnBeforeDeparture() {
		assertThatThrownBy(() -> service.create(USER,
				create(LocalDate.of(2026, 12, 5), LocalDate.of(2026, 12, 1), null)))
				.isInstanceOfSatisfying(ApiException.class, e -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
					assertThat(e.getCode()).isEqualTo("INVALID_DATES");
				});
		verify(journeyRepository, never()).save(any());
	}

	@Test
	void getReturnsNotFoundForAnotherUsersJourney() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, OTHER_USER)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.get(OTHER_USER, JOURNEY_ID))
				.isInstanceOfSatisfying(ApiException.class, e -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
					assertThat(e.getCode()).isEqualTo("JOURNEY_NOT_FOUND");
				});
	}

	@Test
	void updatingThePlanRegeneratesTheJourney() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));
		stubSaves();

		JourneyResponse response = service.update(USER, JOURNEY_ID, new UpdateJourneyRequest(
				"Goa Getaway", null, null, null, null, 4, null, null, null, null));

		assertThat(response.title()).isEqualTo("Goa Getaway");
		assertThat(response.travelers()).isEqualTo(4);
		assertThat(response.origin()).isEqualTo("Ahmedabad");
		assertThat(response.budget()).isEqualByComparingTo("50000");
		assertThat(response.interests()).containsExactly("Beaches", "Food");
		assertThat(response.status()).isEqualTo(JourneyStatus.READY);
		assertThat(response.itinerary()).isNotEmpty();
		verify(itemRepository).deleteByJourneyId(existing.getId());
	}

	@Test
	void updatingOnlyTheTitleKeepsGeneratedContent() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));

		JourneyResponse response = service.update(USER, JOURNEY_ID, new UpdateJourneyRequest(
				"Renamed", null, null, null, null, null, null, null, null, null));

		assertThat(response.title()).isEqualTo("Renamed");
		verify(itemRepository, never()).deleteByJourneyId(any());
		verify(itemRepository, never()).saveAll(anyList());
	}

	@Test
	void updateValidatesMergedDates() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));

		// New end date is before the stored start date (2026-12-01).
		assertThatThrownBy(() -> service.update(USER, JOURNEY_ID, new UpdateJourneyRequest(
				null, null, null, null, LocalDate.of(2026, 11, 30), null, null, null, null, null)))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getCode()).isEqualTo("INVALID_DATES"));
		verify(journeyRepository, never()).save(any());
	}

	@Test
	void deleteRemovesItemsThenJourney() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));

		service.delete(USER, JOURNEY_ID);

		verify(itemRepository).deleteByJourneyId(existing.getId());
		verify(journeyRepository).delete(existing);
	}

	@Test
	void deleteDoesNothingForAnotherUsersJourney() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, OTHER_USER)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.delete(OTHER_USER, JOURNEY_ID)).isInstanceOf(ApiException.class);
		verify(itemRepository, never()).deleteByJourneyId(any());
		verify(journeyRepository, never()).delete(any());
	}

	@Test
	void addItemSavesAUserItemOnTheRequestedDay() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));
		when(itemRepository.save(any(ItineraryItem.class))).thenAnswer(inv -> inv.getArgument(0));

		ItineraryItemResponse response = service.addItem(USER, JOURNEY_ID,
				new CreateItineraryItemRequest(3, 10 * 60, ItemKind.ACTIVITY, " Scenic nature walk ", " ", null));

		assertThat(response.day()).isEqualTo(3);
		assertThat(response.startMinutes()).isEqualTo(600);
		assertThat(response.kind()).isEqualTo(ItemKind.ACTIVITY);
		assertThat(response.title()).isEqualTo("Scenic nature walk");
		assertThat(response.place()).isNull();
		verify(itemRepository).save(any(ItineraryItem.class));
	}

	@Test
	void addItemRejectsADayBeyondTheTrip() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));

		// The stored trip is 2026-12-01 to 2026-12-05, so five days.
		assertThatThrownBy(() -> service.addItem(USER, JOURNEY_ID,
				new CreateItineraryItemRequest(6, 600, ItemKind.FOOD, "Dinner", null, null)))
				.isInstanceOfSatisfying(ApiException.class, e -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
					assertThat(e.getCode()).isEqualTo("INVALID_DAY");
				});
		verify(itemRepository, never()).save(any());
	}

	@Test
	void addItemIsNotFoundForAnotherUsersJourney() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, OTHER_USER)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.addItem(OTHER_USER, JOURNEY_ID,
				new CreateItineraryItemRequest(1, 600, ItemKind.FOOD, "Dinner", null, null)))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getCode()).isEqualTo("JOURNEY_NOT_FOUND"));
		verify(itemRepository, never()).save(any());
	}

	@Test
	void removeItemDeletesAnItemOfTheJourney() {
		ItineraryItem item = new ItineraryItem(null, 1, 600, ItemKind.FOOD, "Dinner", null, null, ItemOrigin.USER);
		UUID itemId = UUID.randomUUID();
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));
		when(itemRepository.findByIdAndJourneyId(itemId, existing.getId())).thenReturn(Optional.of(item));

		service.removeItem(USER, JOURNEY_ID, itemId);

		verify(itemRepository).delete(item);
	}

	@Test
	void removeItemIsNotFoundWhenTheItemBelongsToAnotherJourney() {
		UUID itemId = UUID.randomUUID();
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));
		when(itemRepository.findByIdAndJourneyId(itemId, existing.getId())).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.removeItem(USER, JOURNEY_ID, itemId))
				.isInstanceOfSatisfying(ApiException.class,
						e -> assertThat(e.getCode()).isEqualTo("ITEM_NOT_FOUND"));
		verify(itemRepository, never()).delete(any());
	}

	private void stubSaves() {
		when(journeyRepository.save(any(Journey.class))).thenAnswer(inv -> inv.getArgument(0));
		when(itemRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
	}
}
