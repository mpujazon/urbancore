# UrbanCore

UrbanCore is an Angular web application for reporting, exploring, and managing city incidents. It connects citizens with municipal operations through public incident tracking, authenticated reporting, admin workflows, planned actions, city-aware discovery, and public statistics.

The product goal is to provide a centralized platform for municipalities to track, prioritize, and manage urban incidents while giving citizens a transparent way to report issues and follow their resolution.

## Project Documentation

Detailed product and delivery documentation lives in `docs/`:

| Document | Contents |
| --- | --- |
| [`docs/Project 4. Design, Analysis and Flow Diagrams.md`](docs/Project%204.%20Design,%20Analysis%20and%20Flow%20Diagrams.md) | Product goals, scope, personas, requirements, use cases, information architecture, route map, domain model, data contracts, technical architecture notes, delivery phases, and Mermaid flow diagrams. |
| [`docs/Project 4. Epics, User Stories and Tasks.md`](docs/Project%204.%20Epics,%20User%20Stories%20and%20Tasks.md) | Epics, user stories, acceptance criteria, technical notes, implementation tasks, suggested delivery order, and backend dependencies. |
| [`docs/UrbanCore - Final Design.fig`](docs/UrbanCore%20-%20Final%20Design.fig) | Figma design file used as the visual reference for the project. |

Use this README for setup and execution. Use the `docs/` files for product analysis, implementation planning, and architectural diagrams.

## Design Note

The Figma file was used as a design reference, not as a strict design system. Some screens and components were improved during development to better fit technical constraints, usability, responsiveness, accessibility, and the final product flow.

## Main Features

- Public homepage with SEO metadata and city incident management positioning.
- Public incident explorer with filters for status, category, city, and date range.
- Incident detail pages with summary, status history, location, gallery, description, and planned actions.
- Citizen dashboard for authenticated users to review their submitted incidents.
- Incident reporting flow with category selection, map-based location, reverse geocoding, media upload, and AI-assisted suggestions.
- Admin incident management for reviewing incidents, changing status, assigning priority, deleting reports, and creating planned actions.
- Planned actions calendar and detail panel for scheduled municipal work.
- Public statistics dashboard with charts and incident summary data.
- City-aware discovery for explorer, planned actions, and statistics views.
- Google/Firebase authentication with backend user synchronization and role-based route protection.

## Tech Stack

- Angular 21
- Angular standalone components and lazy-loaded routes
- Angular Fire and Firebase Authentication
- RxJS
- SCSS
- Leaflet maps
- Chart.js
- Vitest through Angular's unit test builder
- pnpm

## Requirements

- Node.js compatible with Angular 21
- pnpm `10.33.2` or newer
- A running UrbanCore backend API
- Firebase project credentials for authentication
- Cloudinary-backed upload signing support from the backend for incident media uploads

## Setup

Install dependencies:

```bash
pnpm install
```

For local development, the app uses `src/environments/environment.development.ts`, which points to:

```text
http://localhost:8080/api
```

Make sure the backend API is available at that URL, or update `API_BASE_URL` in the environment file for your local setup.

## Execution

Start the local development server:

```bash
pnpm start
```

Open the app at:

```text
http://localhost:4200
```

Create a production build:

```bash
pnpm build
```

The build script runs `tools/set-env.ts` before compiling. This generates `src/environments/environment.ts` from environment variables and then builds the app with Angular's production configuration.

Run a development build in watch mode:

```bash
pnpm run watch
```

## Testing

Tests are configured through Angular's unit test builder and Vitest (specs use `describe`/`it`/`vi` from Vitest, backed by jsdom). Angular CLI schematics are configured with `skipTests: true` in `angular.json`; specs are added manually alongside source files using the `.spec.ts` convention.

### Run Tests

```bash
pnpm test
```

This runs the full suite once. Vitest runs in watch mode by default; `pnpm test` maps to `ng test --watch=false` so it exits after the run.

### Run Coverage

```bash
pnpm test:coverage
```

Generates a text summary in the terminal, a JSON summary at `coverage/coverage-summary.json`, and an HTML report at `coverage/index.html`. Open the HTML report in a browser for per-directory and per-file breakdowns:

```bash
open coverage/index.html
```

### Coverage Thresholds

The project aims for **≥ 70% line coverage** overall, with mandatory coverage for new services, stores, interceptors, guards, facades, mappers, utilities, and pipes. UI components (pages, layout) are tested where feasible but template-heavy components are lower priority.

### Test Architecture

| Pattern | Use |
|---|---|
| `TestBed.configureTestingModule` with `provideHttpClient`/`provideHttpClientTesting` | API service specs — mock `HttpTestingController` |
| `TestBed.runInInjectionContext` | Functional guards and interceptors |
| `TestBed.createComponent` + `fixture.componentRef.setInput` | Standalone component specs with signal inputs |
| Plain function imports | Pure mappers, utilities, pipes, validators |
| Store `@Injectable()` classes with mocked dependencies via `TestBed` | State store specs (`provide` dependency overrides) |
| `vi.mock('@angular/fire/auth', ...)` | Firebase auth mocking for auth service |

For guard specs, use a helper to unwrap `CanActivateFn` results (which can be `boolean`, `UrlTree`, `Observable`, or `Promise`):

```ts
import { firstValueFrom, isObservable } from 'rxjs';

async function resolveGuardResult(result: unknown): Promise<unknown> {
  const awaited = await result;
  if (isObservable(awaited)) return firstValueFrom(awaited);
  return awaited;
}
```

### Source File Naming

Specs live next to their target file:

```text
src/app/core/guards/auth-guard.ts
src/app/core/guards/auth-guard.spec.ts
```

## Environment Variables

Production builds read environment variables in `tools/set-env.ts` and generate `src/environments/environment.ts`.

| Variable | Description | Default |
| --- | --- | --- |
| `API_BASE_URL` | Base URL for the UrbanCore backend API. | `http://localhost:8080/api` |
| `FIREBASE_API_KEY` | Firebase web API key. | None |
| `FIREBASE_AUTH_DOMAIN` | Firebase authentication domain. | None |
| `FIREBASE_PROJECT_ID` | Firebase project ID. | None |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket. | None |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID. | None |
| `FIREBASE_APP_ID` | Firebase app ID. | None |
| `FIREBASE_MEASUREMENT_ID` | Firebase measurement ID. | None |

Example production build command:

```bash
API_BASE_URL="https://api.example.com/api" \
FIREBASE_API_KEY="your-api-key" \
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com" \
FIREBASE_PROJECT_ID="your-project-id" \
FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app" \
FIREBASE_MESSAGING_SENDER_ID="your-sender-id" \
FIREBASE_APP_ID="your-app-id" \
FIREBASE_MEASUREMENT_ID="your-measurement-id" \
pnpm build
```

Do not commit real production secrets or private credentials. Firebase web configuration is public-facing by design, but production values should still be managed through the deployment environment.

## Architecture Overview

The application follows a feature-first Angular structure.

```text
src/app/
  core/       Cross-cutting app infrastructure
  features/   Route-level product areas
  shared/     Reusable components, models, mappers, services, and utilities
```

### Core

`src/app/core` contains application-wide infrastructure:

- `guards`: authentication and role-based route guards.
- `interceptors`: auth token attachment and API error handling.
- `layout`: navbar, footer, avatar, and layout-related models and pipes.
- `permissions`: user permission modeling and lookup logic.
- `routing`: route role configuration.
- `services`: authentication, city context, SEO, and toast notifications.

### Features

`src/app/features` contains route-level business areas:

- `home`: public landing page.
- `incidents-explorer`: public searchable incident map/list experience.
- `incident-detail`: public and admin incident detail pages.
- `report-incident`: authenticated citizen reporting wizard.
- `citizen-dashboard`: citizen-owned incident tracking.
- `admin-incidents`: administrative incident management.
- `planned-actions`: planned municipal work calendar and detail panel.
- `public-statistics`: public statistics dashboard.
- `auth`: unauthorized access page.

### Shared

`src/app/shared` contains reusable building blocks:

- UI components such as incident cards, status pills, pagination, city selector, and toast.
- DTO and view-model definitions.
- API services for public incidents, citizen incidents, incident management, and planned actions.
- Data mappers and utility functions.

### Routing And Data Flow

Routes are defined in `src/app/app.routes.ts` and lazy-load standalone components. Protected routes use `authGuard` and `roleGuard` with role rules from `src/app/core/routing/route-roles.ts`.

HTTP requests go through Angular's `HttpClient` with the configured auth and error interceptors. Backend calls use `environment.API_BASE_URL`. Firebase Authentication provides the user session, and authenticated users are synchronized with the backend through `/auth/sync`.

The broader product flows, domain rules, route map, API contract proposal, and Mermaid diagrams are documented in [`docs/Project 4. Design, Analysis and Flow Diagrams.md`](docs/Project%204.%20Design,%20Analysis%20and%20Flow%20Diagrams.md).

## Useful Commands

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies. |
| `pnpm start` | Start the local development server. |
| `pnpm build` | Generate production environment config and build the app. |
| `pnpm run watch` | Build in development watch mode. |
| `pnpm test` | Run unit tests. |
