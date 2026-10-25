package com.journey.backend.journey.dto;

import com.journey.backend.journey.ItemKind;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateItineraryItemRequest(
		@Min(value = 1, message = "Day must be at least 1")
		int day,
		@Min(value = 0, message = "Start time must be between 0 and 1439 minutes")
		@Max(value = 1439, message = "Start time must be between 0 and 1439 minutes")
		int startMinutes,
		@NotNull(message = "Kind is required")
		ItemKind kind,
		@NotBlank(message = "Title is required")
		@Size(max = 120)
		String title,
		@Size(max = 255)
		String place,
		@Size(max = 1000)
		String description) {

}
