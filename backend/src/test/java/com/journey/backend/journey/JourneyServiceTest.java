package com.journey.backend.journey;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.journey.backend.exception.ApiException;
import com.journey.backend.journey.dto.CreateJourneyRequest;
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
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class JourneyServiceTest {

	private static final UUID USER = UUID.randomUUID();
	private static final UUID OTHER_USER = UUID.randomUUID();
	private static final UUID JOURNEY_ID = UUID.randomUUID();

	@Mock JourneyRepository journeyRepository;
	@Mock ItineraryItemRepository itemRepository;
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
		when(journeyRepository.save(any(Journey.class))).thenAnswer(inv -> inv.getArgument(0));

		JourneyResponse response = service.create(USER,
				create(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 5), null));

		assertThat(response.title()).isEqualTo("Goa Journey");
		assertThat(response.origin()).isEqualTo("Ahmedabad");
		assertThat(response.destination()).isEqualTo("Goa");
		assertThat(response.interests()).containsExactly("Beaches", "Food");
		assertThat(response.status()).isEqualTo(JourneyStatus.DRAFT);
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
	void updateChangesOnlyProvidedFields() {
		when(journeyRepository.findByIdAndUserId(JOURNEY_ID, USER)).thenReturn(Optional.of(existing));
		when(journeyRepository.save(any(Journey.class))).thenAnswer(inv -> inv.getArgument(0));

		JourneyResponse response = service.update(USER, JOURNEY_ID, new UpdateJourneyRequest(
				"Goa Getaway", null, null, null, null, 4, null, null, null, null));

		assertThat(response.title()).isEqualTo("Goa Getaway");
		assertThat(response.travelers()).isEqualTo(4);
		assertThat(response.origin()).isEqualTo("Ahmedabad");
		assertThat(response.budget()).isEqualByComparingTo("50000");
		assertThat(response.interests()).containsExactly("Beaches", "Food");
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
}
