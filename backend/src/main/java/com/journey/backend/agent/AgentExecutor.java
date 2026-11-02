package com.journey.backend.agent;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Supplier;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

/**
 * Runs the agents' blocking HTTP calls on virtual threads instead of the shared ForkJoin pool, and
 * carries the logging context (the run id) onto them so their log lines stay attributable.
 */
@Component
public class AgentExecutor implements AutoCloseable {

	private final ExecutorService delegate = Executors.newVirtualThreadPerTaskExecutor();

	public <T> CompletableFuture<T> supply(Supplier<T> task) {
		Map<String, String> context = MDC.getCopyOfContextMap();
		return CompletableFuture.supplyAsync(() -> {
			if (context != null) {
				MDC.setContextMap(context);
			}
			try {
				return task.get();
			}
			finally {
				MDC.clear();
			}
		}, delegate);
	}

	@Override
	public void close() {
		delegate.close();
	}
}
