package com.journey.backend.journey;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

public enum ItemKind {
	TRAVEL,
	STAY,
	FOOD,
	ACTIVITY;

	/** Lower-case in JSON, matching the frontend's ActivityKind. */
	@JsonValue
	public String value() {
		return name().toLowerCase(Locale.ROOT);
	}
}
