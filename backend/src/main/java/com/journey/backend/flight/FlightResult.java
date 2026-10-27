package com.journey.backend.flight;

public record FlightResult(
		String flightNumber,
		String airline,
		String airlineIata,
		String status,
		String flightDate,
		String departureAirport,
		String departureIata,
		String departureTerminal,
		String departureGate,
		String departureTime,
		String arrivalAirport,
		String arrivalIata,
		String arrivalTerminal,
		String arrivalGate,
		String arrivalTime) {
}
