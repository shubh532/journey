package com.journey.backend.journey;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, UUID> {

	void deleteByJourneyId(UUID journeyId);
}
