package com.journey.backend.journey.dto;

import com.journey.backend.journey.ItemKind;
import com.journey.backend.journey.ItineraryItem;
import java.util.UUID;

public record ItineraryItemResponse(
        UUID id,
        int day,
        int startMinutes,
        ItemKind kind,
        String title,
        String place,
        String description) {

    public static ItineraryItemResponse from(ItineraryItem item) {
        return new ItineraryItemResponse(
                item.getId(),
                item.getDay(),
                item.getStartMinutes(),
                item.getKind(),
                item.getTitle(),
                item.getPlace(),
                item.getDescription()
			);
    }
}
