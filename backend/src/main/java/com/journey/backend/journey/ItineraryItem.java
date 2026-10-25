package com.journey.backend.journey;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trip_itinerary_items", indexes = @Index(name = "idx_trip_itinerary_items_journey_id", columnList = "journey_id"))
@Getter
@NoArgsConstructor
public class ItineraryItem {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "journey_id", nullable = false, updatable = false)
	private UUID journeyId;

	@Column(nullable = false)
	private int day;

	@Column(name = "start_minutes", nullable = false)
	private int startMinutes;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ItemKind kind;

	@Column(nullable = false)
	private String title;

	private String place;

	@Column(length = 1000)
	private String description;

	private Double lat;

	private Double lon;

	@Column(name = "image_url", length = 1000)
	private String imageUrl;

	@Column(name = "source_url", length = 1000)
	private String sourceUrl;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ItemOrigin origin;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	public ItineraryItem(UUID journeyId, int day, int startMinutes, ItemKind kind, String title, String place,
			String description, ItemOrigin origin) {
		this.journeyId = journeyId;
		this.day = day;
		this.startMinutes = startMinutes;
		this.kind = kind;
		this.title = title;
		this.place = place;
		this.description = description;
		this.origin = origin;
	}

	@PrePersist
	void onCreate() {
		createdAt = Instant.now();
	}
}
