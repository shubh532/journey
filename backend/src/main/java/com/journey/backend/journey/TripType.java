package com.journey.backend.journey;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TripType {
	SOLO("Solo"),
	COUPLE("Couple"),
	FAMILY("Family"),
	FRIENDS("Friends");

	private final String label;

	TripType(String label) {
		this.label = label;
	}

	@JsonValue
	public String label() {
		return label;
	}

	@JsonCreator
	public static TripType fromLabel(String value) {
		for (TripType type : values()) {
			if (type.label.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
				return type;
			}
		}
		throw new IllegalArgumentException("Must be one of: Solo, Couple, Family, Friends.");
	}
}
