package com.journey.backend.logging;

/** Keeps logged payloads (prompts, API responses) to a readable size. */
public final class LogText {

	private static final int MAX_CHARS = 4000;

	private LogText() {
	}

	public static long elapsedMs(long startNanos) {
		return (System.nanoTime() - startNanos) / 1_000_000;
	}

	public static String truncate(Object value) {
		String text = String.valueOf(value);
		return text.length() <= MAX_CHARS ? text
				: text.substring(0, MAX_CHARS) + "... (" + (text.length() - MAX_CHARS) + " more chars)";
	}
}
