package com.journey.backend.journey;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, UUID> {

	List<ItineraryItem> findAllByJourneyIdOrderByDayAscStartMinutesAsc(UUID journeyId);

	void deleteByJourneyId(UUID journeyId);
}
