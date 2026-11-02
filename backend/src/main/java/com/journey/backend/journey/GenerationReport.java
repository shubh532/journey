package com.journey.backend.journey;

import java.util.List;

/**
 * What each step of generation contributed, shown to the traveller and stored inside the plan JSON.
 * Wording is user-facing (no model or provider names); {@code runId} ties it to the server's pipeline log.
 */
public record GenerationReport(String runId, long totalMs, List<Step> steps) {

	public GenerationReport {
		steps = steps == null ? List.of() : List.copyOf(steps);
	}

	/** OK: the step ran and its result is used. FALLBACK: the built-in estimate is used instead. */
	public enum Status {
		OK,
		FALLBACK
	}

	public record Step(String id, String label, Status status, String detail, long durationMs) {

	}
}
