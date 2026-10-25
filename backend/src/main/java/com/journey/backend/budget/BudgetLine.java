package com.journey.backend.budget;

/** One labelled amount (whole rupees) in a budget breakdown. */
public record BudgetLine(String label, long amount) {

}
