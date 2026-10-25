package com.journey.backend.journey;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.databind.json.JsonMapper;

/** Persists a {@link GeneratedPlan} as a JSON string in a text column. */
@Converter
public class GeneratedPlanConverter implements AttributeConverter<GeneratedPlan, String> {

	private static final JsonMapper MAPPER = JsonMapper.builder().build();

	@Override
	public String convertToDatabaseColumn(GeneratedPlan plan) {
		return plan == null ? null : MAPPER.writeValueAsString(plan);
	}

	@Override
	public GeneratedPlan convertToEntityAttribute(String json) {
		return json == null ? null : MAPPER.readValue(json, GeneratedPlan.class);
	}
}
