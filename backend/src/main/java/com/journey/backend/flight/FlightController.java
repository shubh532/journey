package com.journey.backend.flight;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

	private final FlightService flightService;

	public FlightController(FlightService flightService) {
		this.flightService = flightService;
	}

	@GetMapping("/search")
	public List<FlightResult> search(@Valid FlightSearchRequest request) {

		System.out.println( "My Request: " + request.toString());
		return flightService.search(request);
	}
}
