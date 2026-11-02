package com.journey.backend.agent;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** A real place or experience found by the research agent, with the page that backs it. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ResearchPlace(String name, String kind, String area, String description, String sourceUrl) {

}
