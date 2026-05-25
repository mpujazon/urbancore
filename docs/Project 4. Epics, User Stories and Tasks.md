# Project 4. Epics, User Stories and Tasks

## 1. Epic Definitions

### **Epic:** E1. Identity and Access

**Business Outcome:** Securely authenticate users, resolve their platform role and city scope, and enforce access control consistently across public, citizen, and admin experiences.

**Included Features:** Google sign-in and session bootstrap, route authorization, role-aware UI rendering, city-context initialization.

### **Epic:** E2. Citizen Reporting Journey

**Business Outcome:** Let citizens report incidents quickly with accurate location and evidence, then track and manage their own reports while policy allows it.

**Included Features:** report wizard, geolocation picker, image upload, citizen dashboard, own-incident edit/delete rules.

### **Epic:** E3. Incident Operations, Lifecycle, and Planning

**Business Outcome:** Give admins a complete operational workspace to triage incidents, assign priority, manage lifecycle transitions, and schedule planned actions linked to incidents.

**Included Features:** admin incidents list, admin detail workspace, search and filters, priority and status updates, map-assisted triage, planned actions calendar, planned actions CRUD.

### **Epic:** E4. Public Transparency and Discovery

**Business Outcome:** Provide a transparent public experience where users can discover incidents, inspect detail pages, review planned actions, and explore aggregated statistics by city.

**Included Features:** public explorer, public detail page, public planned actions calendar, public statistics dashboard, multi-city context switching.

### **Epic:** E5. Platform Quality, UX Resilience, and Release Readiness

**Business Outcome:** Ship the platform with production-like quality gates for validation, accessibility, performance, responsiveness, and test confidence.

**Included Features:** validation and error normalization, retry UX, accessibility and responsive compliance, performance optimization, automated tests and release gates.

## 2. User Stories and Technical Tasks

### **Epic:** E1. Identity and Access

### **Story:** US-01: Google Sign-In

As a **Citizen or City Admin** I want **to securely sign in with my Google account** So that **I can access the platform features allowed for my role.**

**Acceptance Criteria**

- User can click "Sign in with Google" and complete Firebase OAuth authentication.
- OAuth failures or popup cancellations display a clear error message.
- After a successful login, the application retrieves the authenticated session and continues with role resolution.

**Technical Notes**

- Use Firebase Auth Google provider in Angular 21 and keep auth state in a dedicated `AuthService` using Signals.

**Implementation Tasks**

- [FE] Create a standalone login page with loading, success, and error states for the Google sign-in CTA.
- [FE] Implement `AuthService` methods for popup login, logout, token retrieval, and auth-state synchronization.
- [FE] Persist only the minimum frontend session state needed for routing and role-aware rendering.
- [BE required before FE integration] Configure Spring Security to validate Firebase ID tokens and reject invalid sessions with consistent `401` and `403` responses.
- [BE] Define the authenticated user contract returned after login bootstrap, including `id`, `email`, `displayName`, `role`, and `cityId` or allowed city scopes.

### **Story:** US-02: Session Bootstrap and Role Resolution

As an **authenticated user** I want **the application to resolve my profile and role immediately after login** So that **I am redirected to the correct starting area without manual selection.**

**Acceptance Criteria**

- After Firebase authentication, the app fetches the authenticated user profile from the backend.
- Citizen users are redirected to `/dashboard/my-incidents`.
- Admin users are redirected to `/admin/incidents`.
- If profile resolution fails, the user sees a recoverable session error state.

**Technical Notes**

- Keep profile bootstrap separate from raw Firebase auth to avoid coupling UI routing to provider-specific data.

**Implementation Tasks**

- [FE] Add a session bootstrap flow that exchanges the Firebase token for application profile data on app startup and after login.
- [FE] Create a typed `CurrentUser` model distinct from the backend DTO.
- [FE] Implement role-based post-login redirects and an application-level loading shell while bootstrap is pending.
- [BE required before FE integration] Expose `GET /users/me` returning role, profile, and city-scope data required by guards and layout navigation.
- [BE] Normalize bootstrap error responses for disabled users, missing roles, and unauthorized access so the frontend can map them predictably.

### **Story:** US-03: Route and Capability Authorization

As a **platform user** I want **the application to restrict routes and actions according to my authentication state and role** So that **I only see and access the features intended for me.**

**Acceptance Criteria**

- Public routes remain accessible without login.
- Citizen-only and admin-only routes are protected.
- Unauthorized users are redirected to login or an unauthorized-safe fallback page.
- Buttons, CTAs, and mutation actions are hidden or disabled when the user lacks permission.

**Technical Notes**

- Use Angular guards for route access and a role-aware capability layer for template-level decisions.

**Implementation Tasks**

- [FE] Implement `AuthGuard`, `RoleGuard`, and unauthenticated-only route handling for `/login`.
- [FE] Create a small permission utility or service for role-aware UI rendering in templates and components.
- [FE] Protect admin mutations in the UI, including incident status updates, planning actions, and deletes.
- [BE required before FE completion] Ensure all protected REST endpoints enforce the same permission model server-side and return consistent authorization errors.
- [BE] Document endpoint-level authorization rules so frontend route and UI guards match backend behavior.

### **Story:** US-04: City Context Initialization and Switching

As a **public or authenticated user** I want **the platform to resolve and switch city context** So that **explorer, planned actions, and statistics always reflect the selected municipality.**

**Acceptance Criteria**

- The app resolves an initial city context on first load.
- User can switch city context from public discovery screens.
- City changes refresh all city-aware data views.
- The selected city is preserved when navigating between explorer, planned actions, and statistics.

**Technical Notes**

- Keep city context in a shared store or signal service separate from auth state.

**Implementation Tasks**

- [FE] Create a `CityContextService` using Signals to hold `selectedCity`, available cities, and persistence rules.
- [FE] Add a shared city selector component reusable in public explorer, planned actions, and statistics pages.
- [FE] Wire route query params or local persistence so the selected city survives refresh and navigation.
- [BE required before FE integration] Expose `GET /cities` with at least `id`, `name`, `slug`, `center`, and optional map bounds.
- [BE] Ensure public list, planned actions, and statistics endpoints accept `cityId` or equivalent city filter.

### **Epic:** E2. Citizen Reporting Journey

### **Story:** US-05: Report New Incident

As a **Citizen** I want **to submit a new incident providing a category, description, and an image** So that **the municipality has enough context to understand and fix the issue.**

**Acceptance Criteria**

- The form requires title, category, description, incident location, and at least one image.
- The submit button remains disabled while the form is invalid or submission is in progress.
- On successful submission, a success toast is displayed and the user is redirected to the dashboard.
- The created incident is immediately visible in the citizen dashboard after refresh or cache invalidation.

**Technical Notes**

- Use a typed reactive form and map the form model to a dedicated `CreateIncidentRequest` payload.

**Implementation Tasks**

- [FE] Build the report route as a standalone wizard page with typed form controls, step state, and submission state.
- [FE] Create a frontend form model and mapper for `title`, `category`, `description`, `latitude`, `longitude`, `cityId`, and uploaded image URLs.
- [FE] Add success and failure toast handling and invalidate or refresh the citizen incident list after create.
- [BE required before FE integration] Expose `POST /incidents` with validation rules for required fields, coordinates, category enum, and image URL list.
- [BE] Return the created incident summary including `id`, `status`, timestamps, and display fields used by the citizen dashboard.

### **Story:** US-06: Geolocation Map Picker

As a **Citizen** I want **to drop a pin on an interactive map when reporting an incident** So that **the city workers know the exact location of the problem without needing a typed address.**

**Acceptance Criteria**

- A map component is visible inside the report flow.
- User can click or tap to place and move a marker.
- A "Use my current location" action centers the map using browser geolocation.
- Selected coordinates are stored in the report form payload.

**Technical Notes**

- Prefer direct Leaflet integration compatible with Angular 21 and keep the selected coordinates in form state rather than in DOM state.

**Implementation Tasks**

- [FE] Create a reusable map picker component that emits `lat` and `lng` when the marker changes.
- [FE] Integrate browser geolocation with permission-denied and unavailable-location handling.
- [FE] Display coordinate confirmation in the report flow so the user can verify the selected point.
- [BE dependency for production validation] Backend must accept decimal coordinates and validate coordinate ranges before persistence.
- [BE] If city-based validation is required, provide city bounds or a city-lookup rule to validate that the selected point belongs to the active city.

### **Story:** US-07: Incident Image Upload

As a **Citizen** I want **to upload incident evidence images safely** So that **my report includes useful visual context without exposing insecure upload behavior.**

**Acceptance Criteria**

- User can upload at least one image in the report flow.
- Unsupported file types or oversize files are rejected with clear feedback.
- Uploaded images return optimized URLs that are later saved with the incident.
- Upload failures do not erase the rest of the report form data.

**Technical Notes**

- Use signed Cloudinary uploads and keep any signing secret exclusively in the backend.

**Implementation Tasks**

- [FE] Implement an upload component with preview, remove, retry, and progress states.
- [FE] Enforce client-side constraints for MIME type, max size, and max file count before calling the upload flow.
- [FE blocked by BE] Integrate the upload step only after the backend provides a signed-upload endpoint or equivalent secure upload contract.
- [BE required before FE integration] Expose `POST /uploads/signature` or an equivalent endpoint returning the data needed for signed Cloudinary upload.
- [BE] Persist only the resulting image URLs and public IDs needed for later deletion or transformation.

### **Story:** US-08: Citizen Dashboard (My Incidents)

As a **Citizen** I want **to see a list of all the incidents I have reported** So that **I can track whether they are pending, in progress, planned, cancelled, or resolved.**

**Acceptance Criteria**

- Page displays a list or grid of incident cards.
- Each card shows thumbnail, title, category, created date, and status badge.
- An empty state appears when the user has no incidents and includes a clear CTA to report an issue.
- User can open one of their incidents to review its current state.

**Technical Notes**

- Keep the citizen dashboard query independent from the public explorer query because ownership rules and visible fields differ.

**Implementation Tasks**

- [FE] Create a dashboard page with loading, empty, error, and populated states.
- [FE] Build a reusable incident card component for citizen-specific summary fields.
- [FE] Implement dashboard data fetching with cache invalidation after create, edit, or delete operations.
- [BE required before FE integration] Expose a citizen-scoped endpoint such as `GET /incidents?reporterId=current` or `GET /users/me/incidents`.
- [BE] Return only incidents owned by the authenticated citizen and include pagination metadata if the dataset can grow.

### **Story:** US-09: Edit or Delete Own Incident Under Policy

As a **Citizen** I want **to edit or delete my own incident only while policy allows it** So that **I can correct a mistake without changing incidents that are already under active municipal handling.**

**Acceptance Criteria**

- Edit and delete actions are shown only when the incident is owned by the current citizen and the lifecycle policy allows it.
- Editable incidents open a prefilled form with allowed fields only.
- Delete requires explicit confirmation.
- If the lifecycle changed and the action is no longer allowed, the system explains why and prevents the mutation.

**Technical Notes**

- Keep editability rules aligned with backend policy and never trust only client-side checks.

**Implementation Tasks**

- [FE] Add conditional edit and delete CTAs to citizen-owned incident cards and detail pages.
- [FE] Reuse the report form for edit mode with prefilled values and explicit mutation handling.
- [FE] Add a confirmation modal for delete and refresh affected screens after success.
- [BE required before FE integration] Expose `PATCH /incidents/{id}` and `DELETE /incidents/{id}` with ownership and lifecycle policy validation.
- [BE] Return a meaningful business error when the incident is no longer editable or deletable so the frontend can show a policy message instead of a generic failure.

### **Epic:** E3. Incident Operations, Lifecycle, and Planning

### **Story:** US-10: Admin Incident Backoffice

As a **City Admin** I want **to view a paginated data table of all reported incidents** So that **I can review them and decide what needs maintenance first.**

**Acceptance Criteria**

- Table shows incident id, category, priority, date, status, reporter, and a row action.
- Table supports pagination and page-size changes.
- Only admins can access the route.
- Data refreshes when pagination changes.

**Technical Notes**

- Use a dedicated admin list model because the admin table requires fields not shown in citizen or public views.

**Implementation Tasks**

- [FE] Build an admin incidents page with a data-table layout, paginator, and column configuration.
- [FE] Add typed query state for `page`, `size`, `sort`, and filters.
- [FE] Implement a row action that navigates to the admin incident detail workspace.
- [BE required before FE integration] Expose `GET /admin/incidents` or an admin-capable incidents endpoint with pagination and sort support.
- [BE] Include admin presentation fields such as `reporterDisplayName`, `priority`, and `linkedPlannedActionsCount` when available.

### **Story:** US-11: Backoffice Filters, Search, and Sort

As a **City Admin** I want **to filter incidents by status and category, search by keyword, and sort by relevant fields** So that **I can triage the backlog efficiently.**

**Acceptance Criteria**

- Filter bar includes status, category, date, and keyword controls.
- Filters can be combined simultaneously.
- Sort order can be changed without losing active filters.
- A clear-filters action resets the full query state.

**Technical Notes**

- Debounce free-text input and keep query state serializable so the route can restore it.

**Implementation Tasks**

- [FE] Implement a filter bar using typed reactive controls or signal-backed state.
- [FE] Synchronize filter state with table reloads and route query params.
- [FE] Add debounced keyword search and a reset action that clears both UI and request state.
- [BE required before FE integration] Support server-side filtering and sorting parameters for status, category, keyword, date range, priority, and created date.
- [BE] Return pagination metadata that remains valid under filtered result sets.

### **Story:** US-12: Admin Incident Detail Workspace

As a **City Admin** I want **to open a detailed operational workspace for one incident** So that **I can review evidence, location, lifecycle data, and linked actions in one place.**

**Acceptance Criteria**

- The page shows title, description, category, images, coordinates or map, status, priority, reporter summary, and timestamps.
- The page shows linked planned actions if they exist.
- The page exposes clear actions for updating priority, status, and starting planning.
- If the incident is not found, the page shows an admin-safe fallback state.

**Technical Notes**

- Keep this page as the primary operational workspace for lifecycle and action planning.

**Implementation Tasks**

- [FE] Build the admin incident detail route with loading, not-found, and error states.
- [FE] Add sections for metadata, evidence images, location map, lifecycle controls, and linked planned actions summary.
- [FE] Make the planning CTA prominent and contextual to this incident.
- [BE required before FE integration] Expose `GET /admin/incidents/{id}` with full admin-safe detail, including linked planned actions and reporter summary.
- [BE] Return both lifecycle and permission metadata if the frontend should conditionally enable or disable certain admin controls.

### **Story:** US-13: Update Incident Priority and Status

As a **City Admin** I want **to assign a priority and update the lifecycle status of an incident** So that **maintenance teams and citizens can see the latest operational state.**

**Acceptance Criteria**

- Admin can update priority using the allowed enum values.
- Admin can update lifecycle status only through valid transitions.
- Success feedback appears after a valid update.
- Updated values are reflected in the admin list and any dependent views.

**Technical Notes**

- Status transitions must be backend-controlled to avoid invalid client-driven lifecycle changes.

**Implementation Tasks**

- [FE] Add priority and status controls to the admin incident detail workspace.
- [FE] Disable save actions while a mutation is pending and refresh list/detail state after success.
- [FE] Render business-rule validation errors inline when the backend rejects an invalid transition.
- [BE required before FE integration] Expose `PATCH /incidents/{id}/priority` and `PATCH /incidents/{id}/status` or an equivalent mutation contract with transition validation.
- [BE] Return the updated incident snapshot after mutation so the frontend can refresh state without a second request when possible.

### **Story:** US-14: Admin Map-Assisted Triage

As a **City Admin** I want **to review incidents on a synchronized map and list** So that **I can prioritize geographically clustered issues more effectively.**

**Acceptance Criteria**

- Admin can view incidents on a map while keeping the table or list in sync.
- Selecting an incident in one surface highlights it in the other.
- Filters affect both the map markers and the list.
- Admin can open the incident detail page from either surface.

**Technical Notes**

- Reuse the same underlying query state for map and list to avoid divergent datasets.

**Implementation Tasks**

- [FE] Create a split-view admin triage layout with shared query state for list and map.
- [FE] Implement marker selection, row selection, and cross-highlighting between surfaces.
- [FE] Preserve the current filter and viewport context when navigating to detail and back.
- [BE required before FE optimization] Provide list endpoints with coordinates in the response or a dedicated marker dataset endpoint for filtered admin results.
- [BE] Ensure filtered results remain consistent between tabular and map use cases for the same query parameters.

### **Story:** US-15: Planned Actions Calendar Management

As a **City Admin** I want **to manage planned actions in a calendar view** So that **I can understand upcoming maintenance workload and scheduling conflicts.**

**Acceptance Criteria**

- Admin can open `/admin/planned-actions` and see scheduled actions in calendar or agenda format.
- User can change visible date range and view mode.
- Calendar refreshes when range or city changes.
- Admin can open an action from the calendar to edit it.

**Technical Notes**

- Keep the calendar query shape aligned with public planned actions so shared rendering pieces can be reused where possible.

**Implementation Tasks**

- [FE] Implement the admin planned actions page with month, week, and agenda states if the chosen calendar library supports them.
- [FE] Add date-range and city-aware query handling.
- [FE] Connect event selection to action detail or edit flows.
- [BE required before FE integration] Expose a planned actions read endpoint filtered by city and date range, returning incident linkage and status.
- [BE] Return normalized start and end timestamps and enough incident summary data to render event cards and tooltips.

### **Story:** US-16: Plan Action from Incident Detail

As a **City Admin** I want **to create a planned action directly from an incident detail page** So that **I can schedule the response in context and automatically move the incident into the planned stage.**

**Acceptance Criteria**

- The admin incident detail page exposes a prominent "Plan actions for this incident" CTA.
- The planned action form opens with `incidentId` prefilled and locked.
- After successful creation, the planned action appears in the incident detail and in the admin calendar.
- The linked incident status becomes `PLANNED` automatically after successful action creation.

**Technical Notes**

- The incident lifecycle update to `PLANNED` should be treated as a backend-managed side effect of planned action creation.

**Implementation Tasks**

- [FE] Reuse a single planned action form component in both contextual and standalone admin entry points.
- [FE] Support prefilled incident context and disable incident selection when the flow starts from incident detail.
- [FE] Refresh incident detail and calendar data after a successful create.
- [BE required before FE integration] Expose `POST /planned-actions` accepting `incidentId`, schedule data, description, and status.
- [BE] On successful creation, link the planned action to the incident and automatically transition the incident to `PLANNED`.

### **Story:** US-17: Edit and Delete Planned Actions with Incident Recalculation

As a **City Admin** I want **to edit or delete planned actions linked to an incident** So that **the planning calendar and the incident lifecycle remain accurate.**

**Acceptance Criteria**

- Admin can update planned action schedule and metadata.
- Admin can delete a planned action only after explicit confirmation.
- Calendar and incident detail views refresh after mutation.
- If all linked planned actions are deleted or become `CANCELLED`, the incident status recalculates to `CANCELLED` automatically.

**Technical Notes**

- Lifecycle recalculation belongs in the backend domain layer and should not be implemented only in the frontend.

**Implementation Tasks**

- [FE] Add edit and delete actions for planned actions from the calendar and incident detail contexts.
- [FE] Reuse the planned action form for edit mode and preserve unsaved values on validation failure.
- [FE] Show mutation success and failure feedback without losing current route context.
- [BE required before FE completion] Expose `PATCH /planned-actions/{id}` and `DELETE /planned-actions/{id}` with recalculation logic for the linked incident.
- [BE] Return the updated planned action and linked incident lifecycle outcome, or make sure follow-up reads reflect the recalculated status immediately.

### **Epic:** E4. Public Transparency and Discovery

### **Story:** US-18: Public Incidents Explorer

As an **Unauthenticated Visitor, Citizen, or City Admin** I want **to explore incidents through a synchronized list and map** So that **I can quickly discover issues happening in a selected city.**

**Acceptance Criteria**

- The public explorer loads incidents and markers for the selected city.
- Search, filters, and pagination update the visible result set.
- Map markers and list items stay synchronized.
- User can open a public incident detail page from the list or map.

**Technical Notes**

- Keep the public explorer data contract public-safe and separate from admin fields such as reporter identity or internal notes.

**Implementation Tasks**

- [FE] Build the public explorer route with split-view desktop layout and stacked mobile layout.
- [FE] Implement shared query state for search, filters, pagination, and selected marker.
- [FE] Add localized empty and partial-error states so list and map can fail independently.
- [BE required before FE integration] Expose a public-safe incidents endpoint supporting city, category, status, date, area, search, pagination, and coordinates.
- [BE] Exclude private or admin-only fields from the public explorer payload.

### **Story:** US-19: Public Incident Detail Transparency Page

As an **Unauthenticated Visitor, Citizen, or City Admin** I want **to view a public-safe incident detail page** So that **I can understand the issue, its current status, and any related planned action information.**

**Acceptance Criteria**

- The page shows title, category, description, status, timestamps, location, and evidence images allowed for public display.
- The page shows related public-safe planned actions when they exist.
- Not-found or non-public incidents render a safe fallback view.
- The page includes links back to the explorer or related public views.

**Technical Notes**

- The detail contract must hide reporter private data and any internal-only comments or admin notes.

**Implementation Tasks**

- [FE] Build the public incident detail page with metadata, evidence, map, and related actions sections.
- [FE] Add not-found and retry states.
- [FE] Reuse shared badge, media, and location display components where possible.
- [BE required before FE integration] Expose `GET /incidents/{id}` or a public detail endpoint returning only public-safe fields.
- [BE] Include any related planned actions that are allowed to be displayed publicly.

### **Story:** US-20: Public Planned Actions Calendar

As an **Unauthenticated Visitor, Citizen, or City Admin** I want **to browse scheduled planned actions in a public calendar** So that **I can understand what maintenance work is already planned in the selected city.**

**Acceptance Criteria**

- Public users can access `/planned-actions` without authentication.
- The view loads events for the selected city and date range.
- User can change range and inspect an action summary linked to an incident.
- If no events exist, the calendar shows a no-data guidance state.

**Technical Notes**

- Public planned actions should share the calendar rendering pattern with the admin route but expose fewer controls.

**Implementation Tasks**

- [FE] Build the public planned actions page with read-only calendar and agenda states.
- [FE] Add city selector, date navigation, and event summary panel.
- [FE] Prevent admin mutation controls from rendering on the public route.
- [BE required before FE integration] Expose a public-safe planned actions endpoint filtered by city and date range.
- [BE] Return only fields safe for public viewing, including incident reference data necessary for navigation.

### **Story:** US-21: Public Statistics Dashboard

As an **Unauthenticated Visitor, Citizen, or City Admin** I want **to review aggregate incident metrics and trends** So that **I can understand the state of incidents across category, status, time, and location.**

**Acceptance Criteria**

- The page displays KPI summaries and chart widgets.
- Filters such as timeframe, category, status, and city update the dashboard.
- If one widget fails, the rest of the dashboard remains available.
- If there is no data for the selected filter set, the page shows a dedicated no-data state.

**Technical Notes**

- Treat dashboard widgets as independently loadable sections if the backend exposes separate aggregation endpoints.

**Implementation Tasks**

- [FE] Build the statistics page with reusable KPI cards, chart containers, and filter controls.
- [FE] Add partial-loading and partial-error handling per widget or per dataset.
- [FE] Keep filter state shareable through route query params if appropriate.
- [BE required before FE integration] Expose aggregation endpoints for KPI totals and chart datasets scoped by city and optional filters.
- [BE] Define stable response shapes for timeseries, category breakdown, status breakdown, and geographic summaries so chart components can be typed cleanly.

### **Story:** US-22: Multi-City Public Discovery

As a **public user** I want **to switch between cities while staying in the same public flow** So that **I can compare incidents, planned actions, and statistics across municipalities.**

**Acceptance Criteria**

- City switching is available on explorer, planned actions, and statistics.
- Changing city reloads only the necessary datasets.
- Selected city remains visible in the UI and persists during navigation.
- Invalid or unavailable city selections fall back safely.

**Technical Notes**

- This story depends on both the shared city context service and city-aware backend filters being available.

**Implementation Tasks**

- [FE] Reuse the shared city context service across all public discovery pages.
- [FE] Add route-aware synchronization so city changes trigger only relevant data reloads.
- [FE] Implement fallback handling when a stored city no longer exists.
- [BE required before FE completion] Guarantee that `GET /cities`, public incidents, public planned actions, and statistics all use the same city identifiers and availability rules.
- [BE] Return a consistent city ordering and stable slugs or ids suitable for URLs and query params.

### **Epic:** E5. Platform Quality, UX Resilience, and Release Readiness

### **Story:** US-23: Validation, Error Normalization, and Retry UX

As a **platform user** I want **clear validation and error feedback with retry options when possible** So that **I understand what failed and can recover without losing my progress.**

**Acceptance Criteria**

- Required fields show inline validation messages before submission.
- API validation, permission, and server errors are mapped to understandable messages.
- Retry actions are available for recoverable fetches and uploads.
- Failed forms preserve entered data whenever possible.

**Technical Notes**

- Normalize backend errors into a frontend error model instead of handling raw HTTP responses in every component.

**Implementation Tasks**

- [FE] Create shared validation message helpers for typed reactive forms.
- [FE] Implement a global HTTP error mapper or interceptor that converts backend errors into a UI-friendly model.
- [FE] Add retry support for list fetches, detail fetches, and image uploads.
- [BE required before FE normalization] Standardize backend error payloads for validation, authorization, not-found, and server failures.
- [BE] Include machine-readable error codes where business rules matter, such as invalid status transition or incident no longer editable.

### **Story:** US-24: Accessibility and Responsive Compliance

As a **platform user** I want **the application to be accessible and usable on mobile, tablet, and desktop** So that **I can complete the main flows regardless of device or assistive technology needs.**

**Acceptance Criteria**

- Core routes are fully usable across mobile, tablet, and desktop breakpoints.
- Interactive elements are keyboard accessible and have visible focus states.
- Forms have associated labels, error text, and screen-reader-friendly feedback.
- There are no critical accessibility failures in automated checks for MVP routes.

**Technical Notes**

- Accessibility must be designed into each page rather than added only at the end.

**Implementation Tasks**

- [FE] Review all primary routes for semantic structure, focus order, and keyboard interactions.
- [FE] Implement responsive layouts for explorer, report wizard, dashboard, admin table, and calendar routes.
- [FE] Add accessible labels, live regions, and text alternatives for status changes, image uploads, and result counts.
- [FE] Run Lighthouse and accessibility tooling on core routes and fix blocking issues before release.
- [BE dependency for complete accessibility] Ensure backend-provided labels, enums, and status values are human-readable or mapped cleanly so accessible UI text is not derived from raw internal codes.

### **Story:** US-25: Performance Optimization and Lazy Loading

As a **platform user** I want **the application to load and respond quickly** So that **exploring incidents, viewing maps, and managing data feels smooth.**

**Acceptance Criteria**

- Public and private routes use route-based lazy loading.
- Images are optimized for thumbnails and detail views.
- Core pages stay within the defined Lighthouse and web-vitals targets.
- Heavy UI elements such as maps and calendars do not block initial page rendering unnecessarily.

**Technical Notes**

- Performance work should be measured per route because the map and calendar pages have different bottlenecks.

**Implementation Tasks**

- [FE] Configure route-level lazy loading for public explorer, planned actions, statistics, dashboard, and admin features.
- [FE] Use responsive image URLs and Cloudinary transformations for thumbnails and detail media.
- [FE] Defer non-critical map and calendar initialization until route and data state are ready.
- [BE dependency for image optimization] Persist Cloudinary public identifiers or transformation-ready URLs so the frontend can request optimized image variants.
- [BE] Support paginated and filter-efficient endpoints to avoid oversized list payloads that degrade frontend performance.

### **Story:** US-26: Automated Test Pyramid and Release Gates

As a **solo developer** I want **automated tests and release checks for the critical flows** So that **I can iterate on frontend and backend in parallel without breaking the MVP.**

**Acceptance Criteria**

- Critical frontend flows have unit, component, or integration coverage.
- At least the main end-to-end journeys are testable for login, reporting, admin management, and public exploration.
- A repeatable quality gate exists for linting, tests, and production build.
- Failed checks block release readiness until resolved.

**Technical Notes**

- Prioritize coverage for role-based routing, report submission, public explorer filters, and planned action side effects.

**Implementation Tasks**

- [FE] Add unit tests for auth state, guards, city context, DTO mappers, and validation helpers.
- [FE] Add component or integration tests for report form validation, admin incident detail mutations, and public explorer filter synchronization.
- [FE] Add E2E coverage for login, create incident, update incident status, and create planned action flows.
- [BE dependency for stable E2E] Provide deterministic seed data or test fixtures plus stable non-production auth and API environments for automated test runs.
- [BE] Make lifecycle side effects and error contracts stable enough that frontend automated tests do not depend on ambiguous backend behavior.

## 3. Suggested Delivery Order

1. E1 first: authentication, profile bootstrap, guards, and city context.
2. E2 next: report flow, map picker, image upload, and citizen dashboard.
3. E3 after that: admin list, detail workspace, lifecycle mutations, and planned actions.
4. E4 in parallel once city-aware public endpoints exist: explorer, detail, planned actions, and statistics.
5. E5 continuously across all milestones: validation, accessibility, performance, and tests.

## 4. Backend Dependencies That Unblock Frontend Work

- `GET /users/me` with role and city scope is needed before frontend session bootstrap and final route redirection can be completed.
- `GET /cities` is needed before multi-city public views can be integrated beyond mock data.
- Signed upload support is needed before secure Cloudinary integration can be finished.
- `POST /incidents` and citizen incident read endpoints are needed before the report flow can be tested end to end.
- Admin incidents list and detail endpoints are needed before the backoffice can move from static UI to real data.
- Planned actions CRUD plus lifecycle side effects are needed before the planning flows can be considered complete.
- Statistics aggregation endpoints are needed before the public dashboard can move beyond placeholder widgets.
- Standardized backend error payloads are needed before frontend-wide error normalization can be implemented cleanly.
