package com.journey.backend.journey;

import com.journey.backend.journey.dto.CreateJourneyRequest;
import com.journey.backend.journey.dto.JourneyResponse;
import com.journey.backend.journey.dto.UpdateJourneyRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {

	private final JourneyService journeyService;

	public JourneyController(JourneyService journeyService) {
		this.journeyService = journeyService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public JourneyResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateJourneyRequest request) {
		return journeyService.create(userId(jwt), request);
	}

	@GetMapping
	public List<JourneyResponse> list(@AuthenticationPrincipal Jwt jwt) {
		return journeyService.list(userId(jwt));
	}

	@GetMapping("/{id}")
	public JourneyResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
		return journeyService.get(userId(jwt), id);
	}

	@PatchMapping("/{id}")
	public JourneyResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
			@Valid @RequestBody UpdateJourneyRequest request) {
		return journeyService.update(userId(jwt), id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
		journeyService.delete(userId(jwt), id);
	}

	private static UUID userId(Jwt jwt) {
		return UUID.fromString(jwt.getSubject());
	}
}
