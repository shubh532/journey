package com.journey.backend.journey;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JourneyRepository extends JpaRepository<Journey, UUID> {

	List<Journey> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

	Optional<Journey> findByIdAndUserId(UUID id, UUID userId);
}
