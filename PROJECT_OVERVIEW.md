# Journey — Project Overview

## 1. Project Name

**Journey**

Journey is an AI-powered travel planning platform designed to help users plan personalized trips from a single experience.

The product was previously named **Tripper**.

All new user-facing development must use:

> **Journey**

Do not introduce new `Tripper` branding.

If legacy Tripper references are found while working on a directly related file, they may be updated when safe. Do not perform unrelated repository-wide renaming unless explicitly requested.

---

## 2. Product Vision

Journey aims to make travel planning simpler, faster, and more personalized.

Traditional trip planning often requires users to switch between multiple services for:

- Destination research
- Flights
- Hotels
- Places to visit
- Maps
- Itinerary creation
- Budget planning
- Activities
- Weather
- Booking

Journey aims to bring these planning activities into one intelligent travel workspace.

The long-term experience should allow a user to describe a trip naturally and let Journey help organize the complete plan.

Example:

> Plan a 5-day Goa trip from Ahmedabad for 2 people under ₹45,000. We like beaches, nightlife, good food, and want a decent hotel.

Journey should eventually transform this request into a structured trip containing:

- Travel dates
- Transportation options
- Stay recommendations
- Daily itinerary
- Activities
- Places
- Routes
- Estimated expenses
- Budget breakdown
- Travel recommendations

The user should then be able to modify the trip conversationally.

Example:

> Make day 3 more relaxed.

or:

> Find a cheaper hotel.

or:

> Add more nightlife.

or:

> Keep the total budget below ₹40,000.

Journey should update the relevant parts of the trip without requiring the user to start planning again.

---

# 3. Product Philosophy

Journey should feel like an intelligent travel companion rather than a traditional booking portal.

The product should prioritize:

1. Simplicity
2. Personalization
3. Clear information
4. Low cognitive load
5. Fast planning
6. Trust
7. User control
8. Transparent pricing
9. High-quality travel discovery

AI should simplify travel planning.

AI should not make the interface more complicated.

---

# 4. Current Development Strategy

Journey is currently being developed using a:

> **Frontend-first, feature-by-feature approach**

The frontend experience is built and validated before integrating complex backend services and third-party travel APIs.

During the current stage:

- Mock data is acceptable.
- Local frontend state is acceptable.
- Simulated AI behavior is acceptable.
- Real APIs should not be added unless explicitly requested.
- Real AI integration should not be added unless explicitly requested.

Each feature should be independently understandable, testable, and reviewable.

---

# 5. Current Frontend Technology

The frontend currently uses:

- React
- TypeScript
- Material UI (MUI)
- Lucide React icons

Always inspect the repository before assuming additional technologies or libraries.

Do not install additional libraries when existing project dependencies can solve the requirement.

---

# 6. UI Direction

Journey should look and feel like a premium modern SaaS product.

The visual direction is:

> Premium SaaS + Travel + AI + Minimalism

The interface should feel:

- Clean
- Modern
- Premium
- Intelligent
- Trustworthy
- Spacious
- Responsive
- Content-focused

Journey uses a premium indigo/violet visual identity with neutral SaaS surfaces.

The interface may use restrained glossy effects through:

- Soft shadows
- Subtle gradients
- Surface layering
- Controlled translucency
- Subtle highlights
- Refined hover states

Avoid excessive:

- Glassmorphism
- Gradients
- Glow
- Shadows
- Animation
- Decorative elements
- Oversized border radius

Premium should come primarily from typography, spacing, consistency, imagery, interaction quality, and hierarchy.

---

# 7. MUI Theme

Material UI is the primary UI system.

Global visual decisions should preferably be handled through the existing MUI theme.

Reuse existing:

- Palette
- Typography
- Spacing
- Breakpoints
- Shadows
- Border radius
- Component variants
- Component overrides

Avoid introducing arbitrary colors or styling systems inside individual components.

Use semantic theme values whenever possible.

The application should maintain a consistent visual identity across all screens.

---

# 8. Icons

Journey uses **Lucide React**.

Lucide is already installed.

Use Lucide icons whenever standard interface icons are required.

Do not install another icon library unless explicitly requested.

Avoid emojis as interface icons.

Icons should support meaning rather than decorate every element.

---

# 9. Responsive Design

Every Journey feature must support:

- Desktop
- Tablet
- Mobile

Desktop layouts should use available space effectively without stretching content excessively.

Tablet layouts should gracefully reorganize content.

Mobile layouts should prioritize essential information and actions.

Avoid:

- Fixed desktop widths
- Horizontal overflow
- Tiny touch targets
- Desktop-only navigation patterns
- Overcrowded cards

Responsive behavior is part of feature completion, not a later enhancement.

---

# 10. Accessibility

Journey should maintain sensible accessibility standards.

Features should use:

- Semantic HTML
- Visible focus states
- Proper labels
- Keyboard-accessible interactions
- Accessible buttons
- Appropriate input autocomplete attributes
- Sufficient color contrast
- Meaningful image alt text

Interactive states must not depend entirely on color.

---

# 11. Current User Journey

The current frontend flow is evolving toward:

```text
Sign In / Sign Up
        ↓
       Home
        ↓
 Destination Discovery
        ↓
    Plan Journey
        ↓
 Journey Preferences
        ↓
      Review
        ↓
 Generate My Journey
        ↓
 AI Generation Experience
        ↓
   Journey Results
```

Journey Results and the deeper trip workspace are part of upcoming development.

---

# 12. Authentication

Journey currently includes authentication UI.

The authentication experience includes:

### Sign In

Users can enter:

- Email
- Password

The interface also contains a Google authentication option.

### Sign Up

Users can enter:

- Full name
- Email
- Password
- Confirm password

The interface includes frontend validation and appropriate password controls.

Google authentication may currently be UI-only depending on the implementation state.

Do not assume real OAuth, JWT, refresh tokens, sessions, or backend authentication exist unless verified in the repository.

Do not implement authentication infrastructure unless explicitly requested.

---

# 13. Authentication → Home

After successful authentication behavior, the user navigates into the Journey application.

The main landing experience for authenticated users is the Home page.

---

# 14. Home Page

Home acts as Journey's primary travel discovery entry point.

The Home page currently contains or is expected to contain:

- Journey branding
- Search
- User location display
- User avatar
- User name
- Navigation categories
- Destination discovery
- Destination cards
- Plan Trip actions

The Home page should remain discovery-focused.

Do not overload it with detailed itinerary or booking functionality.

---

# 15. Home Header

The Home header provides primary application-level information.

It includes:

- Journey brand
- Destination search
- User location
- User identity

The search experience is currently frontend-focused.

Do not assume Google Places, AI search, or backend destination search is connected unless verified.

The user location may currently be mock/display data.

Do not request browser location permissions unless explicitly required.

---

# 16. Home Navigation

The Home experience includes travel-related navigation such as:

- Upcoming Journey
- History
- Domestic
- International

These may currently operate primarily as UI navigation/filter states.

Do not assume backend data exists for these sections.

Future implementation may connect them to persistent Journey data.

---

# 17. Destination Discovery

Journey displays destination cards to help users discover potential trips.

Example destinations may include:

- Goa
- Manali
- Jaipur
- Kerala
- Bali
- Dubai
- Paris
- Tokyo

Destination data may currently be mocked.

Each destination card generally contains:

- Destination image
- Destination name
- Short summary
- Plan Trip CTA

Destination imagery should remain visually important.

---

# 18. Plan Trip Action

The primary action from a destination card is:

> **Plan Trip**

Selecting Plan Trip begins the Journey planning experience.

When possible, the selected destination should be carried into the planning flow so users do not need to enter it again.

Example:

```text
Goa

Plan Trip
    ↓

Plan your journey

From
Ahmedabad

Destination
Goa
```

---

# 19. Plan Journey

Plan Journey is one of the core product experiences.

Its purpose is to collect enough information to generate a personalized trip without overwhelming the user.

The experience should feel guided rather than like a large booking form.

The planning flow currently follows or is expected to follow these steps:

1. Destination
2. Dates & Travelers
3. Budget & Style
4. Interests
5. Review

---

# 20. Destination Step

The destination step collects:

- Origin
- Destination

If the user entered the flow through a destination card, the destination should already be populated when possible.

Location autocomplete is not required during the frontend-first stage.

---

# 21. Dates & Travelers

The planning flow collects:

- Departure date
- Return date
- Number of travelers

It may also collect the trip type.

Supported trip types include:

- Solo
- Couple
- Family
- Friends

The experience should remain simple.

Do not introduce complicated passenger categories unless explicitly requested.

---

# 22. Budget

Journey collects an estimated total trip budget.

During the initial MVP, INR may be treated as the primary/default currency.

Example:

> ₹50,000

The budget later becomes an important constraint for AI planning.

Future Journey functionality should attempt to keep recommendations within the user's stated budget.

---

# 23. Travel Style

Users can indicate the type of travel experience they prefer.

Current travel styles include:

### Budget

Make the most of every rupee.

### Balanced

Balance comfort and value.

### Luxury

Prioritize premium stays and experiences.

Travel style should eventually influence:

- Hotels
- Transportation
- Activities
- Dining
- Overall itinerary decisions

---

# 24. Interests

Users can select multiple travel interests.

Current interests may include:

- Adventure
- Nature
- Food
- Beaches
- Culture
- Nightlife
- Shopping
- Relaxation

These preferences should eventually influence AI-generated recommendations.

Example:

A traveler selecting:

> Beaches + Food + Nightlife

should receive a materially different itinerary from someone selecting:

> Nature + Culture + Relaxation.

---

# 25. Review

Before generating a Journey, users should be able to review the information they provided.

The Review experience summarizes:

- Origin
- Destination
- Dates
- Travelers
- Trip type
- Budget
- Travel style
- Interests

Users should understand what Journey will use when creating the trip.

---

# 26. Generate My Journey

The primary CTA at the end of planning is:

> **Generate My Journey**

This action represents the transition between user configuration and AI-assisted trip creation.

Real AI may not yet be connected.

During frontend development, generation may be simulated.

---

# 27. AI Generation Experience

After requesting a Journey, users see a generation experience explaining what Journey is doing.

This should not be a generic loading spinner.

Journey should communicate progress using understandable travel-planning stages.

Example stages:

1. Understanding your preferences
2. Exploring the best experiences
3. Building your itinerary
4. Finding stays that fit your style
5. Optimizing your budget
6. Finalizing your journey

These labels describe the experience from the user's perspective.

Avoid exposing internal technical concepts such as:

- LLM calls
- Agent execution
- Tool calls
- Prompt execution
- Model inference

---

# 28. Generation Progress

During the frontend-first stage, generation progress may be simulated.

Simulation should remain lightweight and easy to replace later.

The eventual backend may provide real progress events.

The UI should therefore conceptually support:

- Pending stage
- Active stage
- Completed stage
- Completion
- Future error state

---

# 29. Journey Ready

When generation finishes, Journey should communicate:

> **Your journey is ready**

The user will eventually transition into the generated Journey workspace.

This workspace is one of the next major areas of development.

---

# 30. Next Major Feature — Journey Overview

The next major product area is the **Journey Overview**.

Journey Overview will act as the central summary for a generated trip.

Example:

```text
Goa Journey

Ahmedabad → Goa
Oct 12 – Oct 17
2 Travelers

Estimated Cost
₹42,500

Budget
₹50,000
```

It should allow users to quickly understand the complete trip before exploring individual details.

---

# 31. Journey Workspace

Long term, a generated Journey should behave as a structured workspace rather than a single AI message.

The user should be able to navigate between major trip areas such as:

- Overview
- Itinerary
- Flights
- Hotels
- Explore
- Map
- Budget

These sections should represent different views of the same Journey.

---

# 32. Overview

The Overview should eventually summarize:

- Destination
- Origin
- Dates
- Travelers
- Trip style
- Estimated total cost
- Budget
- Flight summary
- Hotel summary
- Important itinerary highlights
- Weather summary
- Key recommendations

The Overview should remain concise.

Detailed information belongs in dedicated sections.

---

# 33. Itinerary

The itinerary will become one of Journey's most important features.

It should present the trip day-by-day.

Example:

```text
Day 1
Arrival & North Goa

09:30
Arrive at Goa Airport

11:00
Hotel Check-in

13:00
Lunch

15:00
Aguada Fort

18:00
Candolim Beach
```

Each day may eventually include:

- Activities
- Attractions
- Restaurants
- Transportation
- Travel time
- Estimated cost
- Notes

---

# 34. Itinerary Modification

Future users should be able to modify generated itineraries.

Possible actions include:

- Add activity
- Remove activity
- Replace activity
- Move activity
- Change day
- Make day more relaxed
- Make day more adventurous
- Reduce cost
- Add restaurant
- Add attraction

AI-assisted modification should preserve the rest of the Journey wherever possible.

---

# 35. Flights

Journey will eventually provide flight discovery and comparison.

Flight information may include:

- Airline
- Origin airport
- Destination airport
- Departure time
- Arrival time
- Duration
- Stops
- Price
- Baggage information
- Booking/provider link

During early frontend development, flight data may be mocked.

Real provider integration should be introduced separately.

---

# 36. Hotels

Journey will eventually provide accommodation recommendations.

Hotel information may include:

- Name
- Photos
- Location
- Rating
- Price per night
- Total estimated cost
- Amenities
- Distance from important locations
- Booking/provider link

Recommendations should eventually reflect:

- Budget
- Travel style
- Itinerary
- Destination
- User preferences

---

# 37. Explore

The Explore experience will help users discover:

- Attractions
- Restaurants
- Cafes
- Beaches
- Museums
- Nightlife
- Shopping
- Cultural experiences
- Outdoor activities

Recommendations should eventually be personalized using the interests collected during Plan Journey.

---

# 38. Maps

Journey will eventually provide a map-based view of the trip.

The map may display:

- Hotel
- Attractions
- Restaurants
- Activities
- Airports
- Daily routes
- Travel distances
- Estimated travel times

Map integration should be implemented separately from basic itinerary UI.

Do not add map providers unless explicitly requested.

---

# 39. Budget

Journey should eventually provide a clear budget breakdown.

Potential categories include:

- Transportation
- Flights
- Accommodation
- Food
- Activities
- Local travel
- Shopping
- Miscellaneous

Example:

```text
Total Budget
₹50,000

Estimated Spend
₹42,500

Remaining
₹7,500
```

Journey should help users understand where their money is going.

---

# 40. Budget Intelligence

Future AI planning should treat budget as a real constraint rather than decorative information.

If the Journey exceeds budget, the product should eventually be capable of suggesting alternatives such as:

- Cheaper hotel
- Different flight
- Fewer paid activities
- Alternative restaurants
- Different transportation
- Modified trip duration

---

# 41. Conversational Trip Editing

A major future capability is conversational modification.

Users should eventually be able to type requests such as:

> Make this trip cheaper.

> Replace the hotel with something near the beach.

> Add one adventure activity.

> Make day 2 less busy.

> Find an earlier flight.

> Add more vegetarian restaurants.

Journey should determine which parts of the trip need modification.

The user should not need to regenerate the entire trip for every small change.

---

# 42. AI Direction

Journey is intended to become an AI-assisted product.

AI will eventually help with:

- Understanding trip requests
- Destination recommendations
- Itinerary generation
- Travel preference interpretation
- Budget optimization
- Hotel recommendations
- Activity recommendations
- Trip modification
- Travel explanations

AI should produce structured Journey information that the frontend can render consistently.

Avoid designing the product as only a chatbot.

---

# 43. Future Travel Data

Journey will eventually need real external travel information.

Potential categories include:

- Flights
- Hotels
- Places
- Routes
- Maps
- Weather

These integrations should be introduced incrementally.

Do not integrate every provider at once.

---

# 44. Provider Independence

Journey should avoid exposing third-party provider details throughout the user experience.

For example, users should primarily interact with concepts such as:

- Flight
- Hotel
- Place
- Route

rather than provider-specific terminology.

Providers may change over time.

The product experience should remain consistent.

---

# 45. Booking Direction

Direct booking is not required for the initial MVP.

The first production version may allow users to:

1. Discover an option in Journey.
2. Review the details.
3. Continue to the external provider.
4. Complete booking with the provider.

Direct payment and booking should only be implemented later when required.

---

# 46. Price Handling

Travel prices change frequently.

Future real-data functionality should clearly distinguish between:

- Estimated prices
- Current provider prices
- Final booking prices

Journey should never imply that an old price is guaranteed.

Before a future booking action, prices should be revalidated.

---

# 47. User Control

AI should recommend.

The user should remain in control.

Important actions should eventually require explicit user confirmation.

Examples:

- Selecting a flight
- Selecting a hotel
- Replacing major itinerary items
- Spending beyond budget
- Booking
- Payment

Journey should not silently perform high-impact actions.

---

# 48. Upcoming Journey

The Home navigation includes an Upcoming Journey concept.

In the future, this section should display trips that have not yet occurred.

Possible information:

- Destination
- Dates
- Travelers
- Trip status
- Estimated budget
- Cover image

Selecting an upcoming Journey should open its Journey workspace.

---

# 49. Journey History

History will eventually display previous trips.

Potential uses include:

- Viewing old itineraries
- Reusing destinations
- Reviewing trip information
- Creating a similar trip

This is not currently a priority compared with the core planning flow.

---

# 50. Domestic & International Discovery

Journey may provide separate discovery experiences for:

- Domestic travel
- International travel

These categories should primarily help users explore destinations.

They should not become independent duplicated applications.

---

# 51. Search

Search will eventually become more intelligent.

Future search may support:

- Destination name
- Country
- City
- Travel type
- Interest
- Natural-language requests

Examples:

> Goa

> Beach destinations

> International trips under ₹80,000

> Places for a 4-day couple trip

> Relaxing destinations in December

Current frontend search may remain much simpler.

---

# 52. Personalization

Future Journey experiences may personalize recommendations using:

- Previous trips
- Travel style
- Typical budget
- Preferred activities
- Favorite destinations
- Trip type
- Search behavior

Personalization should remain transparent and useful.

Do not add unnecessary user profiling during the MVP.

---

# 53. Weather

Weather may eventually be shown for planned destinations.

Possible information:

- Temperature
- Conditions
- Rain probability
- Seasonal guidance
- Packing suggestions

Weather should supplement planning rather than dominate the product.

---

# 54. Notifications

Notifications are a future feature.

Potential notifications include:

- Upcoming trip reminder
- Important itinerary reminder
- Flight update
- Weather warning
- Price change

Do not prioritize notifications during the initial planning MVP.

---

# 55. Collaboration

Future versions may allow multiple travelers to collaborate on a Journey.

Possible functionality:

- Invite travelers
- Share itinerary
- Vote on activities
- Add suggestions
- Share expenses

This is outside the initial MVP.

---

# 56. Sharing

Users may eventually share:

- Entire Journey
- Individual itinerary days
- Destination plans
- Public trip links

Sharing should be implemented only after Journey persistence is stable.

---

# 57. Payments

Payments are not part of the current frontend MVP.

Do not implement payment infrastructure unless explicitly requested.

Future payment work must be treated as a separate high-impact feature.

---

# 58. Current Priority Order

Development should currently prioritize the core user journey.

Recommended sequence:

```text
Authentication
      ↓
Home
      ↓
Destination Discovery
      ↓
Plan Journey
      ↓
AI Generation Experience
      ↓
Journey Overview
      ↓
Itinerary
      ↓
Flights
      ↓
Hotels
      ↓
Budget
      ↓
Map
      ↓
Conversational Editing
```

Do not jump to lower-priority supporting features when the core planning experience is incomplete.

---

# 59. MVP Definition

The initial Journey MVP should prove that a user can:

1. Enter the application.
2. Discover or choose a destination.
3. Start planning.
4. Provide trip requirements.
5. Review those requirements.
6. Generate a Journey.
7. View a structured trip.
8. Understand the itinerary.
9. Understand estimated costs.
10. Review relevant travel/stay options.
11. Modify important parts of the plan.
12. Continue toward external booking options when appropriate.

The MVP does not need to automate the entire travel industry.

---

# 60. Features Outside the Initial MVP

Unless explicitly requested, avoid prioritizing:

- Direct flight booking
- Direct hotel booking
- Payments
- Refunds
- Cancellations
- Visa automation
- Train booking
- Bus booking
- Social network features
- Complex collaboration
- Loyalty systems
- Admin dashboards
- Large notification systems
- Advanced analytics
- Overly complex AI orchestration

---

# 61. Development Rules for Claude Code

Before implementing any Journey feature:

1. Inspect the existing repository.
2. Read relevant files.
3. Understand existing patterns.
4. Reuse existing components.
5. Reuse existing theme values.
6. Reuse installed dependencies.
7. Understand routing before changing routes.
8. Identify the smallest necessary change set.

Never assume a structure simply because it is common in React projects.

The repository is the source of truth.

---

# 62. Scope Discipline

Implement only the feature explicitly requested.

Do not automatically build adjacent future features.

For example, if asked to build Journey Overview:

Build Journey Overview.

Do not also implement:

- Flights API
- Hotels API
- Google Maps
- AI integration
- Payment
- Notifications

unless explicitly requested.

---

# 63. Existing Code First

Before creating something new, check whether Journey already contains an appropriate:

- Component
- Hook
- Utility
- Type
- Theme token
- Layout
- Form pattern
- Route pattern
- Data structure

Prefer reuse when it improves consistency.

Do not duplicate existing solutions.

---

# 64. Dependency Discipline

Do not install packages merely because they make a small task easier.

Before adding any dependency, verify whether:

- MUI already solves it.
- Lucide already provides the icon.
- React already provides the required capability.
- The repository already contains a suitable utility.

New dependencies require clear justification.

---

# 65. MUI First

Journey uses Material UI.

Prefer MUI components and existing Journey abstractions for standard interface elements.

Examples include:

- Button
- TextField
- Card
- Paper
- Stack
- Box
- Container
- Typography
- Tabs
- Chip
- Avatar
- Dialog
- Skeleton
- LinearProgress

Use only what is appropriate for the feature.

---

# 66. Styling Discipline

Do not scatter arbitrary visual values throughout components.

Prefer:

- Theme palette
- Theme spacing
- Theme typography
- Theme breakpoints
- Theme shape
- Existing variants

Avoid unnecessary inline hardcoded:

- Hex colors
- Shadows
- Radius values
- Font sizes
- Breakpoints

unless the existing codebase already follows that pattern or the value is genuinely feature-specific.

---

# 67. Component Discipline

Create components around meaningful UI responsibilities.

Avoid one enormous component containing an entire feature.

Also avoid turning every tiny text/icon combination into a separate component.

The goal is:

- Readability
- Reuse where useful
- Easy testing
- Easy review
- Easy future modification

---

# 68. State Management

Use the simplest state-management approach appropriate for the feature.

Do not introduce global state for temporary local UI state.

Examples that usually belong locally:

- Active tab
- Current form step
- Traveler counter
- Selected interests
- Temporary form fields
- Modal state

Use existing global state only when the data genuinely needs to be shared broadly.

---

# 69. Mock Data

Mock data is acceptable during frontend-first development.

Keep mock data structured and separate from presentation when practical.

Avoid repeating hardcoded JSX for similar items.

Mock data should resemble the eventual product data closely enough that it can later be replaced by API responses.

---

# 70. API Readiness

Frontend features should be designed so mock data can eventually be replaced with backend data without rewriting the entire UI.

However, do not over-engineer speculative abstractions.

Build for the current feature while keeping obvious future integration paths clean.

---

# 71. Error and Empty States

When relevant to the requested feature, consider:

- Loading
- Success
- Empty
- Error

Do not build elaborate states for features that do not yet need them.

The experience should remain clear when data is unavailable.

---

# 72. Performance

Avoid unnecessary performance problems.

Pay attention to:

- Large image loading
- Unnecessary rerenders
- Large lists
- Heavy dependencies
- Excessive animation
- Duplicate data processing

Do not prematurely optimize simple UI.

---

# 73. Code Quality

New Journey code should:

- Use meaningful names.
- Follow existing TypeScript conventions.
- Avoid unnecessary `any`.
- Avoid unused imports.
- Avoid unused variables.
- Avoid debug `console.log`.
- Follow existing linting.
- Follow existing formatting.
- Keep logic understandable.
- Add comments only when they explain why something non-obvious exists.

---

# 74. Do Not Refactor Unrelated Code

When implementing a feature, do not:

- Rename unrelated components.
- Reformat unrelated files.
- Rewrite existing working components.
- Change unrelated routes.
- Replace libraries.
- Upgrade dependencies.
- Move large directory structures.
- Change global architecture.

Keep changes focused.

---

# 75. Git-Friendly Development

Each feature should be independently reviewable and commit-friendly.

Examples:

```text
feat: add sign in and sign up UI

feat: add authenticated home discovery UI

style: refine Journey premium SaaS theme

feat: add multi-step plan journey flow

feat: add AI journey generation experience

feat: add journey overview
```

Do not create Git commits unless explicitly requested.

Suggest the appropriate commit message after completing a feature.

---

# 76. Verification

After changing Journey:

1. Review changed files.
2. Check TypeScript issues.
3. Run configured type-checking when appropriate.
4. Run lint when configured.
5. Run formatting/build checks when appropriate.
6. Remove unused code.
7. Verify responsive behavior.
8. Check obvious accessibility problems.
9. Check for horizontal overflow.
10. Verify existing related flows still work.

Never claim a command passed unless it was actually executed.

---

# 77. Final Implementation Summary

After completing a requested feature, provide a concise summary containing:

### Summary

What was implemented.

### Files Changed

Files created or modified and why.

### Existing Code Reused

Relevant components, theme values, utilities, dependencies, or patterns reused.

### Responsive Behavior

How the feature behaves across screen sizes.

### Validation

Actual checks performed.

### Scope Confirmation

Confirm unrelated future features were not implemented.

### Suggested Commit

Provide one concise commit message.

---

# 78. Decision Priority

When multiple implementation choices are possible, prefer:

1. Consistency with the existing Journey repository
2. Simplicity
3. Readability
4. Existing component reuse
5. Existing MUI theme reuse
6. Minimal scope
7. Reviewability
8. Maintainability
9. Responsive behavior
10. Future incremental compatibility

Avoid speculative complexity.

---

# 79. Current Product Focus

The immediate product focus is completing the primary Journey planning loop:

```text
Discover
   ↓
Plan
   ↓
Personalize
   ↓
Generate
   ↓
Review Journey
   ↓
Explore Itinerary
   ↓
Adjust
```

Everything else is secondary until this loop feels complete.

---

# 80. Guiding Principle

When working on Journey, remember:

> Build the smallest polished feature that meaningfully advances the travel-planning experience.

Keep the interface premium.

Keep the implementation simple.

Reuse what already exists.

Stay within scope.

Build each feature so it can evolve incrementally as real AI and travel data are introduced.