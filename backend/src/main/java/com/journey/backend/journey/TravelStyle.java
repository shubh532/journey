package com.journey.backend.journey;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TravelStyle {
	BUDGET("Budget", 0.78),
	BALANCED("Balanced", 0.85),
	LUXURY("Luxury", 0.92);

	private final String label;
	private final double spendRatio;

	TravelStyle(String label, double spendRatio) {
		this.label = label;
		this.spendRatio = spendRatio;
	}

	@JsonValue
	public String label() {
		return label;
	}

	/** Fraction of the traveller's budget a generated plan aims to use. */
	public double spendRatio() {
		return spendRatio;
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
