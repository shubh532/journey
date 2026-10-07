# Spring Boot Backend Skill

## Stack

Current/expected backend stack:

- Java 21
- Spring Boot
- Maven
- Spring Web
- Bean Validation
- Lombok
- Spring AI / Google Gemini

Future dependencies may include:

- PostgreSQL
- Spring Data JPA
- Flyway
- Spring Security
- Redis

Do not assume a future dependency is installed. Inspect `pom.xml` first.

The repository is the source of truth.

---

## Core Rules

For every task:

1. Inspect before editing.
2. Search before creating.
3. Reuse existing code and patterns.
4. Make the smallest change that solves the task.
5. Keep business logic out of controllers.
6. Validate external input.
7. Never expose secrets.
8. Handle errors explicitly.
9. Do not add dependencies unless necessary.
10. Validate the application before finishing.

Do not refactor unrelated working code.

Do not introduce speculative architecture.

---

## Before Editing

Inspect relevant:

- `pom.xml`
- `application.yml` / properties
- Packages
- Controllers
- Services
- DTOs
- Models
- Repositories
- Configuration
- Exception handling
- Tests

Search for an existing implementation before creating a new one.

Follow established repository patterns when they differ from this document.

---

## Package Organization

Prefer package-by-feature for business functionality.

Example:

```text
com.journey
├── config/
├── common/
├── exception/
├── journey/
├── user/
└── ai/
```

A feature may contain its own:

```text
journey/
├── JourneyController.java
├── JourneyService.java
├── dto/
├── model/
├── repository/
└── mapper/
```

Do not create empty packages for hypothetical future functionality.

Avoid reorganizing existing packages unless explicitly requested.

---

## Java

Use modern, readable Java.

Prefer:

- Clear names
- Small focused methods
- Immutability where practical
- Constructor injection
- Records for simple immutable DTOs when consistent with the project
- Enums for finite domain values
- Interfaces only when they provide real value

Avoid:

- Raw types
- Unchecked casts
- Huge methods
- Deep nesting
- Static mutable state
- Utility classes for trivial logic
- Premature abstraction

Do not create interfaces merely because a class has a service suffix.

---

## Spring

Use Spring annotations intentionally.

Common examples:

```java
@RestController
@RequestMapping
@Service
@Repository
@Configuration
@ConfigurationProperties
```

Prefer constructor injection.

Do not use field injection:

```java
@Autowired
private JourneyService journeyService;
```

Prefer:

```java
private final JourneyService journeyService;

public JourneyController(JourneyService journeyService) {
    this.journeyService = journeyService;
}
```

Lombok constructor generation is acceptable if already used consistently.

---

## Controllers

Controllers should handle HTTP concerns.

Responsibilities:

- Receive requests
- Validate input
- Call application/service logic
- Return appropriate responses

Keep controllers thin.

Avoid:

- Business logic
- Gemini prompts
- Database logic
- Complex transformations
- Secret handling

Example:

```java
@PostMapping("/generate")
public GenerateJourneyResponse generate(
        @Valid @RequestBody GenerateJourneyRequest request) {
    return journeyService.generate(request);
}
```

Follow existing API conventions.

---

## Services

Services contain application/business logic.

Examples:

- Journey generation
- Budget rules
- Trip validation
- Coordination with AI/providers
- Persistence coordination

Keep responsibilities focused.

Do not create one giant service for the entire application.

---

## DTOs

Use explicit request/response DTOs for API boundaries.

Do not expose persistence entities directly through controllers.

Example:

```java
public record GenerateJourneyRequest(
        @NotBlank String origin,
        @NotBlank String destination,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @Min(1) int travelers,
        @Positive BigDecimal budget
) {}
```

Reuse existing domain types where appropriate.

Avoid duplicated DTOs that provide no boundary value.

---

## Validation

Validate external input at application boundaries.

Use Bean Validation where appropriate:

```java
@NotBlank
@NotNull
@Email
@Size
@Min
@Max
@Positive
```

Use:

```java
@Valid
```

for request bodies requiring validation.

Cross-field/domain rules belong in appropriate application logic.

Example:

```text
endDate >= startDate
```

Do not rely only on frontend validation.

---

## API Design

Use resource-oriented endpoints and existing project conventions.

Prefer:

```text
POST /api/journeys/generate
GET  /api/journeys/{id}
```

Avoid action-heavy endpoints unless the operation genuinely represents an action.

Use appropriate HTTP methods and status codes.

Do not expose implementation details through API contracts.

---

## Error Handling

Never silently swallow exceptions.

Do not expose:

- Stack traces
- Internal exceptions
- API keys
- Gemini responses containing sensitive internals
- Database details

Prefer centralized exception handling when the project already uses or requires it.

Example:

```java
@RestControllerAdvice
```

Return predictable error responses.

Conceptually:

```json
{
  "code": "JOURNEY_GENERATION_FAILED",
  "message": "We couldn't generate your journey."
}
```

Do not expose raw provider errors directly to the frontend.

---

## Logging

Use the project's logging framework.

Log useful operational context.

Good:

```text
Journey generation failed for destination=Goa
```

Never log:

- API keys
- Passwords
- Tokens
- Authorization headers
- Full sensitive payloads

Avoid excessive logging.

Do not leave `System.out.println` debugging in production code.

---

## Secrets

Secrets must come from secure configuration/environment variables.

Example:

```text
GEMINI_API_KEY
```

Never hardcode secrets.

Never commit real secrets in:

- Java files
- YAML/properties
- `.env.example`
- Tests
- Documentation
- Logs

`.env.example` or documentation may contain:

```text
GEMINI_API_KEY=
```

but never the actual value.

Frontend code must never receive the Gemini secret.

---

## Configuration

Keep environment-specific values outside business logic.

Prefer Spring configuration mechanisms.

Use environment placeholders where appropriate.

Example:

```yaml
spring:
  ai:
    google:
      genai:
        api-key: ${GEMINI_API_KEY}
```

Use the exact configuration properties supported by the installed Spring AI version.

Do not guess configuration names—inspect dependencies/documentation when needed.

Use `@ConfigurationProperties` for larger groups of custom configuration.

---

# AI / Gemini

## Boundary

Gemini integration must remain server-side.

Conceptually:

```text
React
  ↓
Journey API
  ↓
Journey Service
  ↓
AI Integration
  ↓
Gemini
```

Do not expose Gemini-specific SDK types to the frontend.

The frontend should receive Journey domain/application data.

---

## Spring AI

If Spring AI is already configured, reuse it.

Before adding/changing AI dependencies:

1. Inspect `pom.xml`.
2. Verify Spring Boot compatibility.
3. Verify the current Spring AI artifact/configuration.
4. Prefer the official supported integration.
5. Do not add a second AI SDK unnecessarily.

Do not use outdated dependency names from memory when current verification is available.

---

## AI Responsibilities

Use Gemini for planning intelligence such as:

- Journey summaries
- Itinerary generation
- Activity suggestions
- Personalization
- Budget-aware planning
- Travel recommendations

Gemini is not authoritative for live travel inventory.

Do not treat generated content as verified:

- Flight prices
- Hotel availability
- Hotel prices
- Weather
- Opening hours
- Booking availability

Those require appropriate real-time providers.

---

## Structured AI Output

Prefer structured output over parsing free-form Markdown.

Journey generation should return predictable data.

Conceptually:

```text
GeneratedJourney
├── title
├── summary
├── estimatedCost
├── days[]
├── stay
├── transport
├── budget
└── tips[]
```

Validate model output before returning it to the frontend.

Do not blindly trust AI-generated data.

---

## Prompt Management

Keep substantial prompts out of controllers.

Place prompt construction near the AI integration/service responsible for it.

Prompts should clearly specify:

- Role
- User trip inputs
- Constraints
- Budget
- Expected structured output
- Estimation limitations

Avoid giant duplicated prompt strings.

Do not expose internal prompts through APIs.

---

## AI Input

Treat user-controlled text as untrusted input.

Separate application instructions from user data where supported.

Do not allow user content to override:

- Output contract
- Security constraints
- Application rules

Only send data to Gemini that is required for the task.

---

## AI Failure Handling

Handle:

- Timeout
- Rate limit
- Provider unavailable
- Invalid response
- Malformed structured output
- Missing configuration

Translate provider failures into safe Journey-level errors.

Do not automatically retry indefinitely.

---

## External APIs

Keep third-party integration details away from controllers and UI contracts.

Examples of future providers:

- Gemini
- Flights
- Hotels
- Places
- Maps
- Weather

Do not add generic provider frameworks before multiple implementations actually require them.

Keep the current solution simple and replaceable.

---

## Persistence

Only apply these rules when persistence exists.

Use Spring Data JPA when already selected for relational persistence.

Prefer:

- PostgreSQL
- Explicit entity relationships
- Transactions around business operations
- Database migrations

Do not expose JPA entities directly through API responses.

Avoid unnecessary bidirectional relationships.

Be conscious of:

- N+1 queries
- Lazy loading
- Transaction boundaries

Do not add persistence solely because future functionality may need it.

---

## Database Migrations

When Flyway is present, schema changes should use migrations.

Do not rely on destructive automatic schema changes for production workflows.

Keep migrations:

- Ordered
- Focused
- Reviewable

Do not edit old applied migrations unless the project explicitly allows it.

---

## Transactions

Use `@Transactional` at appropriate service boundaries when database operations require atomicity.

Do not place transactions on controllers.

Avoid marking methods transactional without understanding why.

---

## Security

Only apply security-specific implementation when Spring Security exists or the task requests it.

When authentication is introduced:

- Hash passwords using an appropriate password encoder.
- Never store plaintext passwords.
- Validate authorization server-side.
- Do not trust frontend roles/permissions.
- Keep tokens/secrets secure.
- Follow the project's established authentication approach.

Do not build authentication infrastructure as part of unrelated tasks.

---

## CORS

Configure CORS intentionally for the frontend/backend relationship.

During development, allow only required frontend origins.

Do not use unrestricted production CORS such as:

```text
*
```

when credentials or protected APIs are involved.

Reuse existing CORS configuration.

---

## Lombok

Use Lombok only when it improves readability and matches existing conventions.

Avoid excessive annotations that obscure object behavior.

Be cautious with entity-generated:

```java
@Data
```

when JPA entities are introduced.

---

## Testing

Add tests when they provide meaningful value for changed behavior.

Prefer appropriate levels:

- Unit tests for business logic
- Controller tests for HTTP behavior
- Integration tests for important boundaries

Do not create meaningless tests solely for coverage.

Mock external Gemini calls in automated tests unless an explicit integration test is requested.

Tests must never require real production secrets.

---

## Maven

Use the Maven wrapper if present:

```bash
./mvnw
```

On Windows:

```text
mvnw.cmd
```

Do not upgrade Spring Boot, Java, Spring AI, or unrelated dependencies during a feature task unless required.

Keep `pom.xml` changes minimal.

---

## Dependency Rules

Before adding a dependency:

1. Check whether it already exists.
2. Check whether Spring/Spring Boot already provides the capability.
3. Verify compatibility.
4. Add only what the requested feature requires.

Do not add dependencies for hypothetical future features.

---

## Frontend Boundary

The backend and frontend live in the same repository but are separate applications.

Do not modify frontend code during a backend-only task unless integration explicitly requires it.

Do not move backend logic into React.

Never expose server secrets through Vite environment variables.

---

## Scope Control

Implement only the requested feature.

Do not automatically add:

- Authentication
- Database
- Redis
- Kafka
- Microservices
- Docker infrastructure
- WebSockets
- RAG
- Vector databases
- Complex agent systems

unless explicitly required.

Prefer a simple modular Spring Boot application for the current Journey MVP.

---

## Workflow

### 1. Inspect

Read relevant:

- `pom.xml`
- Configuration
- Existing feature code
- Tests

### 2. Search

Find existing:

- DTOs
- Services
- Controllers
- Exceptions
- Config
- Utilities
- AI integration

### 3. Implement

Make the smallest maintainable change.

### 4. Validate

Run appropriate available checks.

Prefer Maven wrapper when present:

```bash
./mvnw test
```

and when appropriate:

```bash
./mvnw verify
```

or:

```bash
./mvnw clean package
```

Use repository-specific commands if different.

Never claim a command passed unless executed.

### 5. Review

Before finishing verify:

- No secrets exposed
- No unused imports
- No debug output
- No unnecessary dependency
- No unrelated changes
- Validation exists where required
- Errors are handled
- Existing behavior is preserved
- Tests/build pass when run

---

## Claude Code Behavior

When working on this backend:

- Inspect before editing.
- Search before creating.
- Reuse before duplicating.
- Keep controllers thin.
- Keep business logic in appropriate services.
- Keep integrations isolated.
- Validate external input.
- Keep secrets server-side.
- Follow repository conventions.
- Avoid over-engineering.
- Stay within scope.
- Preserve existing behavior.
- Do not create commits unless explicitly requested.

If the repository already has a good established pattern, prefer it over inventing another one.

---

## Completion Response

After meaningful changes report:

### Summary
What was implemented.

### Files Changed
Created/modified files and their purpose.

### Reused
Existing services, DTOs, config, utilities, or patterns reused.

### API
Endpoints added/changed when applicable.

### Validation
Commands/tests actually executed and results.

### Security
Mention relevant secret/configuration handling when applicable.

### Scope
Anything intentionally deferred or still mocked.

### Suggested Commit
One concise commit message.

Do not claim checks that were not run.

---

## Definition of Done

A backend task is complete when:

- Requested functionality works.
- Existing behavior is preserved.
- Input is validated where necessary.
- Errors are handled safely.
- Secrets remain server-side.
- No unnecessary dependency was added.
- No unrelated code was changed.
- Code follows existing Spring conventions.
- Tests/build pass when run.
- External integrations fail safely.
- Implementation remains as simple as practical.