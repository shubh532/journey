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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "trips", indexes = @Index(name = "idx_trips_user_id", columnList = "user_id"))
@Getter
@NoArgsConstructor
public class Journey {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "user_id", nullable = false, updatable = false)
	private UUID userId;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private String origin;

	@Column(nullable = false)
	private String destination;

	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;

	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;

	@Column(nullable = false)
	private int travelers;

	@Enumerated(EnumType.STRING)
	@Column(name = "trip_type", nullable = false)
	private TripType tripType;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal budget;

	@Enumerated(EnumType.STRING)
	@Column(name = "travel_style", nullable = false)
	private TravelStyle travelStyle;

	@JdbcTypeCode(SqlTypes.ARRAY)
	@Column(nullable = false, columnDefinition = "text[]")
	private List<String> interests;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private JourneyStatus status;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	public Journey(UUID userId, String title, String origin, String destination, LocalDate startDate,
			LocalDate endDate, int travelers, TripType tripType, BigDecimal budget, TravelStyle travelStyle,
			List<String> interests) {
		this.userId = userId;
		this.title = title;
		this.origin = origin;
		this.destination = destination;
		this.startDate = startDate;
		this.endDate = endDate;
		this.travelers = travelers;
		this.tripType = tripType;
		this.budget = budget;
		this.travelStyle = travelStyle;
		this.interests = List.copyOf(interests);
		this.status = JourneyStatus.DRAFT;
	}

	public void changeTitle(String title) {
		this.title = title;
	}

	public void changePlan(String origin, String destination, LocalDate startDate, LocalDate endDate,
			int travelers, TripType tripType, BigDecimal budget, TravelStyle travelStyle, List<String> interests) {
		this.origin = origin;
		this.destination = destination;
		this.startDate = startDate;
		this.endDate = endDate;
		this.travelers = travelers;
		this.tripType = tripType;
		this.budget = budget;
		this.travelStyle = travelStyle;
		this.interests = List.copyOf(interests);
	}

	@PrePersist
	void onCreate() {
		createdAt = Instant.now();
		updatedAt = createdAt;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}
