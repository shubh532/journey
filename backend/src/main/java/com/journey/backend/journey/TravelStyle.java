package com.journey.backend.journey;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TravelStyle {
	BUDGET("Budget"),
	BALANCED("Balanced"),
	LUXURY("Luxury");

	private final String label;

	TravelStyle(String label) {
		this.label = label;
	}

	@JsonValue
	public String label() {
		return label;
	}

	@JsonCreator
	public static TravelStyle fromLabel(String value) {
		for (TravelStyle style : values()) {
			if (style.label.equalsIgnoreCase(value) || style.name().equalsIgnoreCase(value)) {
				return style;
			}
		}
		throw new IllegalArgumentException("Must be one of: Budget, Balanced, Luxury.");
	}
}
