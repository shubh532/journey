package com.journey.backend.flight;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class FlightService {

	private final AviationStackClient client;

	public FlightService(AviationStackClient client) {
		this.client = client;
	}

	public List<FlightResult> search(FlightSearchRequest request) {
		AviationStackResponse response = client.searchFlights(request.from().toUpperCase(),
				request.to().toUpperCase(), request.date(), request.limit());
		if (response.data() == null) {
			return List.of();
		}
		return response.data().stream().map(FlightService::toResult).toList();
	}

	private static FlightResult toResult(AviationStackResponse.Entry e) {
		AviationStackResponse.Leg dep = e.departure() == null ? new AviationStackResponse.Leg(null, null, null, null, null, null) : e.departure();
		AviationStackResponse.Leg arr = e.arrival() == null ? new AviationStackResponse.Leg(null, null, null, null, null, null) : e.arrival();
		AviationStackResponse.Airline airline = e.airline() == null ? new AviationStackResponse.Airline(null, null) : e.airline();
		AviationStackResponse.Flight flight = e.flight() == null ? new AviationStackResponse.Flight(null, null) : e.flight();
		return new FlightResult(flight.iata(), airline.name(), airline.iata(), e.flightStatus(), e.flightDate(),
				dep.airport(), dep.iata(), dep.terminal(), dep.gate(), time(dep),
				arr.airport(), arr.iata(), arr.terminal(), arr.gate(), time(arr));
	}

	/** Prefer the estimated time when the provider has one, otherwise the schedule. */
	private static String time(AviationStackResponse.Leg leg) {
		return leg.estimated() != null ? leg.estimated() : leg.scheduled();
	}
}
