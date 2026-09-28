# Journey — AI-Powered Trip Planner

Journey is an AI-powered travel planning web application designed to help users plan an end-to-end trip from a single platform.

The long-term product vision includes intelligent itinerary generation, destination discovery, flights, hotels, maps, local transportation, activities, restaurants, budgeting, and booking assistance.

This repository currently focuses specifically on the **frontend application and user experience**.

---

## 1. Product Vision

Planning a trip usually requires switching between multiple applications and websites for:

- Destination research
- Flight search
- Hotel discovery
- Places and attractions
- Maps and routes
- Restaurants
- Budget planning
- Day-wise itinerary creation
- Booking management

Journey aims to bring these workflows together through an AI-assisted planning experience.

Instead of manually researching every part of a trip, a user should eventually be able to provide a request such as:

> Plan a 5-day Goa trip from Ahmedabad for two people under ₹50,000. We prefer beaches, nightlife, good food, and a comfortable hotel.

Journey will transform these requirements into a structured trip plan containing travel options, accommodation, activities, routes, estimated costs, and a day-by-day itinerary.

---

# 2. Current Development Scope

The current development phase is **Frontend First**.

The immediate goal is to build a polished, responsive, production-quality user interface before integrating the complete AI orchestration and travel-provider backend.

Current priorities are:

1. Establish the core application experience.
2. Build reusable UI foundations.
3. Implement features incrementally.
4. Validate navigation and user flows.
5. Build responsive trip-planning interfaces.
6. Prepare UI contracts for future API integration.
7. Keep the frontend maintainable as the product grows.

Backend APIs, AI agents, booking providers, payments, and other external integrations are outside the current frontend implementation scope unless explicitly required by a feature.

---

# 3. Frontend Product Experience

The frontend should eventually support the complete trip lifecycle:

```text
Discover
   ↓
Create Trip
   ↓
Tell AI What You Want
   ↓
Generate Trip Plan
   ↓
Review Recommendations
   ↓
Customize Itinerary
   ↓
Compare Travel & Stay Options
   ↓
Review Budget
   ↓
Book / Continue to Provider
   ↓
Manage Trip
```

The interface should make a complex travel-planning process feel simple and guided.

---

# 4. Core Frontend Areas

The application can progressively evolve around the following product areas.

## 4.1 Landing Experience

The landing experience introduces Journey and provides a clear entry point into trip planning.

Potential UI areas include:

- Hero section
- AI trip-planning input
- Popular destinations
- Product benefits
- Example trips
- Travel inspiration
- Primary call-to-action

The main objective is to help users move quickly from inspiration to planning.

---

## 4.2 AI Trip Planner

The trip planner is the central interaction of the product.

Users should be able to describe their trip naturally.

Example:

```text
Plan a 4-day trip to Manali from Ahmedabad
for two people under ₹40,000.
```

The UI may progressively collect structured information such as:

- Origin
- Destination
- Travel dates
- Number of travelers
- Budget
- Travel style
- Interests
- Accommodation preferences
- Transportation preferences

The experience should avoid making users complete unnecessarily large forms when information can be collected naturally.

---

## 4.3 Trip Workspace

After creating a trip, users should have a central workspace for reviewing and managing the plan.

Conceptually:

```text
Trip Workspace

├── Overview
├── Itinerary
├── Flights
├── Hotels
├── Explore
├── Map
└── Budget
```

This becomes the primary interface for an individual trip.

---

## 4.4 Trip Overview

The overview should summarize the most important information about the trip.

Examples:

- Destination
- Travel dates
- Travelers
- Trip duration
- Estimated total cost
- Selected flight
- Selected hotel
- Weather summary
- Important recommendations
- Planning progress

The objective is to provide a useful trip snapshot without requiring the user to navigate through every section.

---

## 4.5 Itinerary

The itinerary experience represents the user's day-by-day travel schedule.

Example:

```text
Day 2 — North Goa

09:00
Aguada Fort

   ↓ 15 min

11:00
Sinquerim Beach

   ↓ 20 min

13:00
Lunch

15:30
Anjuna Beach

18:30
Sunset

20:00
Dinner
```

Potential itinerary interactions include:

- Day switching
- Timeline visualization
- Activity cards
- Activity details
- Travel time between locations
- Add activity
- Remove activity
- Reorder activity
- Replace recommendation
- Regenerate a day
- Estimated daily cost

These interactions should be introduced incrementally rather than implemented simultaneously.

---

## 4.6 Flights

The flight interface will eventually display results received from external travel APIs.

The frontend should be capable of representing information such as:

- Airline
- Departure airport
- Arrival airport
- Departure time
- Arrival time
- Duration
- Stops
- Baggage information
- Price
- Recommended option
- Booking action

The frontend should remain provider-agnostic so the UI is not tightly coupled to a particular flight API.

---

## 4.7 Hotels

The hotel experience will allow users to explore accommodation recommendations.

Potential information includes:

- Hotel name
- Images
- Location
- Rating
- Price per night
- Total stay cost
- Amenities
- Distance from important areas
- Room information
- Cancellation information
- Booking action

Hotel selection should eventually influence both the itinerary and trip budget.

---

## 4.8 Explore

The Explore experience helps users discover things to do at their destination.

Categories may include:

```text
Attractions
Beaches
Museums
Adventure
Restaurants
Cafes
Shopping
Nightlife
Nature
Cultural Places
```

Place cards may eventually contain:

- Name
- Image
- Category
- Rating
- Location
- Distance
- Estimated visit duration
- Estimated cost
- Opening information
- Add-to-trip action

---

## 4.9 Map Experience

Maps will provide geographical context for the itinerary.

The interface may eventually visualize:

- Hotel
- Attractions
- Restaurants
- Airports
- Stations
- Activity sequence
- Routes
- Travel distances
- Travel duration

A useful layout could combine itinerary and map information:

```text
┌────────────────────────┬───────────────────────┐
│                        │                       │
│     Itinerary          │         Map           │
│                        │                       │
│  09:00 Fort            │     ●────●            │
│      ↓ 15 min          │          │            │
│  11:00 Beach           │          ●            │
│      ↓ 20 min          │                       │
│  13:00 Restaurant      │                       │
│                        │                       │
└────────────────────────┴───────────────────────┘
```

On smaller screens, the layout should adapt rather than preserve a desktop split-screen structure.

---

# 5. Budget Experience

Budget visibility should be a first-class part of trip planning.

A trip may contain cost categories such as:

```text
Flights          ₹12,000
Hotel            ₹14,000
Activities        ₹4,500
Food              ₹6,000
Local Transport   ₹3,000
Other             ₹1,500
─────────────────────────
Estimated Total  ₹41,000
Budget           ₹50,000
Remaining         ₹9,000
```

The UI should make it easy to understand:

- Total estimated cost
- User budget
- Remaining budget
- Cost by category
- Daily expenditure
- Expensive components

Budget information should remain understandable rather than becoming an overly complex financial dashboard.

---

# 6. AI Interaction Experience

AI should feel integrated into Journey rather than appearing as a separate generic chatbot.

Potential interactions include:

```text
"Make this trip cheaper."

"Find a better hotel."

"Remove nightlife."

"Add adventure activities."

"Keep the trip under ₹35,000."

"Make Day 3 less crowded."

"Add one free day."

"Replace this restaurant."
```

The UI should clearly communicate:

- What the AI is doing
- What changed
- What information is still required
- Which recommendations are AI-generated
- Which information comes from external providers
- When user confirmation is required

AI-generated content should not be visually confused with confirmed booking or real-time availability information.

---

# 7. Frontend Architecture Principles

Frontend development follows a **feature-first, incremental approach**.

Each feature should be:

- Self-contained
- Easy to review
- Easy to test
- Easy to modify
- Easy to commit independently
- Consistent with existing architecture

A conceptual organization may resemble:

```text
src/
├── components/
├── features/
├── layouts/
├── pages/
├── routes/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
├── assets/
└── styles/
```

This is conceptual only.

The existing repository structure takes precedence. Do not reorganize the application simply to match this example.

---

# 8. Component Design

Components should represent meaningful UI responsibilities.

Prefer structures such as:

```text
TripOverview
├── TripHeader
├── TripSummary
├── PlanningStatus
└── BudgetSummary
```

or:

```text
ItineraryDay
├── DayHeader
├── ActivityTimeline
└── ActivityCard
```

Avoid both extremes:

```text
One 1500-line TripPage component
```

and unnecessary fragmentation such as:

```text
ActivityTitle
ActivityIcon
ActivityText
ActivityTimeText
ActivityPriceText
```

when those components provide no meaningful reuse or separation.

---

# 9. Design System

The application should maintain one consistent visual language.

Always prefer existing project definitions for:

- Colors
- Typography
- Spacing
- Border radius
- Borders
- Shadows
- Breakpoints
- Buttons
- Form controls
- Cards
- Icons
- Layout patterns

Avoid introducing arbitrary visual values when the project's existing design system can express the requirement.

New design patterns should only be introduced when an existing pattern cannot reasonably support the feature.

---

# 10. Responsive Design

Every feature should consider:

- Desktop
- Tablet
- Mobile
- Narrow screens
- Long destination names
- Variable content
- Loading states
- Empty states

Layouts should prefer flexible sizing over unnecessary fixed dimensions.

Desktop-only layouts must provide sensible smaller-screen behavior.

---

# 11. State Management

State should remain as local as reasonably possible.

Conceptually:

```text
Local component state
        ↓
Feature-level state
        ↓
Shared/global state
```

Global state should only be used when information genuinely needs to be shared across multiple parts of the application.

Potential shared trip state may eventually include:

```ts
Trip {
  id
  origin
  destination
  startDate
  endDate
  travelers
  budget
  preferences
  flights
  hotel
  itinerary
  estimatedCost
}
```

The exact implementation should follow the state-management solution already established in the repository.

---

# 12. API Integration Strategy

Frontend features should not depend directly on third-party travel providers.

The expected architecture is:

```text
Frontend
    │
    ▼
Journey Backend API
    │
    ├── AI Services
    ├── Flight Provider
    ├── Hotel Provider
    ├── Places Provider
    ├── Maps Provider
    └── Weather Provider
```

The frontend should consume stable Journey application models rather than provider-specific response structures.

For example:

```ts
interface FlightOption {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  price: number;
  currency: string;
}
```

rather than exposing provider-specific fields throughout UI components.

This allows backend providers to change without requiring major frontend changes.

---

# 13. Mock Data During UI Development

Because the current phase is UI-first, features may initially use mock data.

Mock data should:

- Represent realistic API responses.
- Be structured similarly to expected frontend models.
- Remain easy to replace with API calls.
- Not become deeply embedded inside presentation components.

Preferred direction:

```text
UI Component
     │
     ▼
Feature Data Layer
     │
     ├── Mock Data     ← current
     │
     └── API Service   ← future
```

This keeps UI development independent from backend availability.

---

# 14. Loading, Empty and Error States

Production-quality UI requires more than the successful data state.

Relevant features should eventually consider:

```text
Loading
Success
Empty
Error
Partial data
```

For example:

```text
Flight Search

Loading
   ↓
Results found → Flight cards

or

No flights → Empty state

or

API failure → Error + Retry
```

These states should be implemented when relevant to the requested feature rather than prematurely across the entire application.

---

# 15. Accessibility

Frontend development should use accessible patterns where practical.

Consider:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Form labels
- Button semantics
- Image alt text
- Appropriate ARIA attributes
- Sufficient contrast
- Accessible interactive elements

Accessibility should be incorporated into components rather than treated only as a final-stage task.

---

# 16. Performance

Frontend implementation should avoid unnecessary performance problems.

Prefer:

- Appropriate component boundaries
- Efficient rendering
- Lazy loading where beneficial
- Optimized images
- Avoiding unnecessary state updates
- Avoiding unnecessary API requests
- Appropriate memoization when justified

Do not add premature optimization where there is no demonstrated need.

---

# 17. Development Workflow

Features are developed one at a time.

For every requested feature:

```text
1. Understand requirement
        ↓
2. Inspect existing implementation
        ↓
3. Identify reusable components/patterns
        ↓
4. Determine minimum required changes
        ↓
5. Implement requested UI
        ↓
6. Verify responsiveness
        ↓
7. Check types/lint/formatting
        ↓
8. Check existing UI
        ↓
9. Review changed files
        ↓
10. Feature ready for review/commit
```

Do not proceed to another feature until it is explicitly requested.

---

# 18. Scope Rules

When implementing a feature:

### Do

- Inspect existing code first.
- Reuse existing components.
- Follow established architecture.
- Follow existing theme tokens.
- Keep changes focused.
- Maintain responsive behavior.
- Use meaningful naming.
- Remove unused code.
- Keep TypeScript types clear.
- Make changes easy to review.

### Do Not

- Refactor unrelated files.
- Implement future features.
- Rewrite working components without reason.
- Introduce unnecessary dependencies.
- Change architecture casually.
- Hardcode arbitrary design values when tokens exist.
- Mix multiple unrelated features.
- Leave debugging code.
- Create Git commits unless explicitly requested.

If an unrelated improvement is discovered, document it separately rather than including it in the current feature.

---

# 19. Git Workflow

Each feature should be independently reviewable and commit-ready.

Example commit boundaries:

```text
feat: add landing page hero

feat: add trip planner input

feat: add trip overview UI

feat: add itinerary timeline

feat: add flight results UI

feat: add hotel results UI

feat: add trip budget summary

feat: add trip map experience
```

Avoid combining unrelated functionality into one change.

Commits should not be created automatically unless explicitly requested.

---

# 20. Current MVP Direction

The initial frontend experience should eventually demonstrate the following flow:

```text
User opens Journey
        ↓
Enters trip requirements
        ↓
AI planning experience
        ↓
Trip generated
        ↓
Trip Overview
        ↓
Day-by-Day Itinerary
        ↓
Flights / Hotels
        ↓
Places + Map
        ↓
Budget
        ↓
User modifies plan
        ↓
Updated Trip
```

Not every part of this flow needs to be implemented immediately.

Each area should be developed and validated independently.

---

# 21. Future Integrations

The frontend architecture should remain compatible with future integrations such as:

- AI trip-planning agents
- Flight search APIs
- Hotel APIs
- Maps and Places APIs
- Weather APIs
- Train and bus services
- Restaurant discovery
- Activity providers
- Booking providers
- Payment systems
- Notifications
- Trip monitoring

These integrations represent product direction, not the current implementation scope.

---

# 22. Core Development Principle

> **Build small. Keep it clean. Reuse existing patterns. Stay within scope. Make every change easy to review and commit independently.**

The goal is not to build every Journey feature immediately.

The goal is to progressively build a cohesive, responsive, maintainable frontend that can evolve into a complete AI-powered travel planning platform.