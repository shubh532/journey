package com.journey.backend.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(ApiException.class)
	ResponseEntity<ApiError> handleApi(ApiException e) {
		return ResponseEntity.status(e.getStatus())
				.body(ApiError.of(e.getCode(), e.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e) {
		Map<String, String> fieldErrors = new LinkedHashMap<>();
		e.getBindingResult().getFieldErrors()
				.forEach(fe -> fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
		return ResponseEntity.badRequest().body(new ApiError(
				"VALIDATION_FAILED", "Request validation failed.", fieldErrors));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException e) {
		return ResponseEntity.badRequest().body(
				ApiError.of("INVALID_REQUEST", "Malformed request body."));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	ResponseEntity<ApiError> handleIntegrity(DataIntegrityViolationException e) {
		log.warn("Data integrity violation", e);
		return ResponseEntity.status(HttpStatus.CONFLICT).body(
				ApiError.of("CONFLICT", "The request conflicts with existing data."));
	}

	@ExceptionHandler(Exception.class)
	ResponseEntity<ApiError> handleUnexpected(Exception e) {
		// Framework exceptions (404, 405, 415, ...) already carry the right status.
		if (e instanceof ErrorResponse framework) {
			HttpStatusCode status = framework.getStatusCode();
			return ResponseEntity.status(status).body(ApiError.of(
					"HTTP_" + status.value(), "The request could not be processed."));
		}
		log.error("Unexpected error", e);
		return ResponseEntity.internalServerError().body(
				ApiError.of("INTERNAL_ERROR", "Something went wrong."));
	}
}
