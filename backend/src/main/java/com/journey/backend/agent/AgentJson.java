package com.journey.backend.agent;

import tools.jackson.databind.json.JsonMapper;

/** Parses the JSON an LLM returns, tolerating the markdown fences models sometimes add. */
final class AgentJson {

	private static final JsonMapper MAPPER = JsonMapper.builder().build();

	private AgentJson() {
	}

	static <T> T parse(String text, Class<T> type) {
		return MAPPER.readValue(stripFences(text), type);
	}

	static String toJson(Object value) {
		return MAPPER.writeValueAsString(value);
	}

	private static String stripFences(String text) {
		String trimmed = text.trim();
		if (trimmed.startsWith("```")) {
			int firstNewline = trimmed.indexOf('\n');
			int lastFence = trimmed.lastIndexOf("```");
			if (firstNewline > 0 && lastFence > firstNewline) {
				return trimmed.substring(firstNewline + 1, lastFence).trim();
			}
		}
		return trimmed;
	}
}
