package com.journey.backend.journey;

import com.journey.backend.exception.ApiException;
import com.journey.backend.journey.dto.CreateJourneyRequest;
import com.journey.backend.journey.dto.JourneyResponse;
import com.journey.backend.journey.dto.UpdateJourneyRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JourneyService {

	private final JourneyRepository journeyRepository;
	private final ItineraryItemRepository itemRepository;

	public JourneyService(JourneyRepository journeyRepository, ItineraryItemRepository itemRepository) {
		this.journeyRepository = journeyRepository;
		this.itemRepository = itemRepository;
	}

	@Transactional
	public JourneyResponse create(UUID userId, CreateJourneyRequest request) {
		validateDates(request.startDate(), request.endDate());
		String destination = request.destination().trim();
		String title = request.title() == null || request.title().isBlank()
				? destination + " Journey"
				: request.title().trim();
		Journey journey = new Journey(userId, title, request.origin().trim(), destination, request.startDate(),
				request.endDate(), request.travelers(), request.tripType(), request.budget(),
				request.travelStyle(), cleanInterests(request.interests()));
		return JourneyResponse.from(journeyRepository.save(journey));
	}

	@Transactional(readOnly = true)
	public List<JourneyResponse> list(UUID userId) {
		return journeyRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(JourneyResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public JourneyResponse get(UUID userId, UUID journeyId) {
		return JourneyResponse.from(find(userId, journeyId));
	}

	@Transactional
	public JourneyResponse update(UUID userId, UUID journeyId, UpdateJourneyRequest request) {
		Journey journey = find(userId, journeyId);
		LocalDate startDate = request.startDate() != null ? request.startDate() : journey.getStartDate();
		LocalDate endDate = request.endDate() != null ? request.endDate() : journey.getEndDate();
		validateDates(startDate, endDate);

		if (request.title() != null && !request.title().isBlank()) {
			journey.changeTitle(request.title().trim());
		}
		journey.changePlan(
				orCurrent(request.origin(), journey.getOrigin()),
				orCurrent(request.destination(), journey.getDestination()),
				startDate,
				endDate,
				request.travelers() != null ? request.travelers() : journey.getTravelers(),
				request.tripType() != null ? request.tripType() : journey.getTripType(),
				request.budget() != null ? request.budget() : journey.getBudget(),
				request.travelStyle() != null ? request.travelStyle() : journey.getTravelStyle(),
				request.interests() != null ? cleanInterests(request.interests()) : journey.getInterests());
		return JourneyResponse.from(journeyRepository.save(journey));
	}

	@Transactional
	public void delete(UUID userId, UUID journeyId) {
		Journey journey = find(userId, journeyId);
		itemRepository.deleteByJourneyId(journey.getId());
		journeyRepository.delete(journey);
	}

	// Always scoped by owner: another user's journey is indistinguishable from a missing one.
	private Journey find(UUID userId, UUID journeyId) {
		return journeyRepository.findByIdAndUserId(journeyId, userId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "JOURNEY_NOT_FOUND",
						"Journey not found."));
	}

	static void validateDates(LocalDate startDate, LocalDate endDate) {
		if (endDate.isBefore(startDate)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DATES",
					"Return date cannot be before departure.");
		}
	}

	private static String orCurrent(String value, String current) {
		return value == null || value.isBlank() ? current : value.trim();
	}

	private static List<String> cleanInterests(List<String> interests) {
		return interests.stream().map(String::trim).distinct().toList();
	}
}
