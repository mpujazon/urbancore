# Accessibility Commit Notes

This document explains the accessibility commits added for image uploads, status changes, and result counts. The goal is to make the interface clearer for screen-reader users and more robust for assistive technologies.

## Commit `59841a9` - `label image upload feedback`

### Files changed

- `src/app/features/report-incident/components/report-incident-media/report-incident-media.html`
- `src/app/features/report-incident/components/report-incident-media/report-incident-media.ts`

### What changed

- Added an accessible name and description to the media evidence panel with `aria-labelledby` and `aria-describedby`.
- Added a hidden live status message: `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`.
- Replaced the short visual helper text `Up to 5 files` with a clearer description of the file limit and supported image formats.
- Connected the file input and upload tile to that helper text.
- Changed the file input label from a generic `Upload evidence files` to `Upload evidence image files`.
- Marked decorative upload and remove icons as `aria-hidden="true"`.
- Changed preview image alt text from only the raw filename to `Uploaded evidence image: <filename>`.
- Changed remove button labels from `Remove <filename>` to `Remove uploaded evidence image <filename>`.
- Changed upload validation errors from `role="status"` to `role="alert"`.
- Added status messages when files are added, removed, rejected, or when AI autocomplete starts.
- Added `aria-busy` to the autocomplete button while suggestions are being generated.

### Why this was done

Screen-reader users need the same feedback that sighted users get visually. Before this change, uploading or removing an image changed the UI, but there was no consistent announcement explaining what happened.

The live region solves that by announcing changes like:

- `1 evidence file added. 1 of 5 selected.`
- `photo.jpg removed. 0 evidence files selected.`
- `photo.pdf was not uploaded. <validation message>`
- `Generating incident details from the first uploaded image.`

The image alt text was also improved. A filename alone can be unclear as alternative text. `Uploaded evidence image: filename.jpg` tells the user what the image represents in this workflow.

`role="alert"` is used for upload errors because errors require attention. `role="status"` is used for non-urgent status updates because those should be announced politely without interrupting the user.

## Commit `efe629d` - `announce incident status updates`

### Files changed

- `src/app/features/incident-detail/components/incident-detail-controls/incident-detail-controls.html`
- `src/app/features/incident-detail/pages/incident-detail-page/incident-detail-page.html`
- `src/app/features/incident-detail/pages/incident-detail-page/incident-detail-page.scss`
- `src/app/features/incident-detail/pages/incident-detail-page/incident-detail-page.ts`
- `src/app/shared/components/toast/toast.html`
- `src/app/shared/components/toast/toast.ts`

### What changed

- Added a screen-reader-only live region to the incident detail page for status and priority update outcomes.
- Added readable labels for status values, so a status update can announce text like `Incident status updated to Resolved.`
- Updated the status and priority form labels from a generic `Update` label to specific labels:
  - `Incident status`
  - `Incident priority`
- Updated the submit buttons from generic `Apply` text to specific actions:
  - `Apply status`
  - `Apply priority`
- Removed redundant `aria-label` attributes from selects that already have visible labels.
- Added accessible live semantics to toast notifications.
- Error toasts now use `role="alert"`; success and info toasts use `role="status"`.
- Toasts now use `aria-atomic="true"` so the full message is announced.
- Toast close buttons now include the toast type and message in their accessible label.
- Removed the `CommonModule` import from the toast component because the template no longer uses `ngClass`.
- Added `ChangeDetectionStrategy.OnPush` to the toast component to match Angular performance/accessibility best practices used elsewhere.

### Why this was done

Status changes are important state changes. If a screen-reader user updates an incident from `In Progress` to `Resolved`, they need confirmation that the action succeeded or failed.

The live region on the detail page gives explicit feedback after the API response:

- Success: `Incident status updated to Resolved.`
- Failure: `Could not update incident status.`

The toast changes make notification behavior more accessible across the app. A visual toast alone is not enough because it can appear and disappear without being announced. Adding roles tells assistive technologies how important the message is.

The form label changes also make the controls easier to understand. A select labelled only as `Update` is ambiguous when there are multiple update forms close together. `Incident status` and `Incident priority` clearly describe each control.

## Commit `6982159` - `announce result count changes`

### Files changed

- `src/app/features/admin-incidents/pages/manage-incidents/manage-incidents.html`
- `src/app/features/admin-incidents/store/admin-incidents.store.ts`
- `src/app/features/incidents-explorer/pages/incident-explorer-page/incident-explorer-page.html`
- `src/app/features/incidents-explorer/store/incidents-explorer.store.ts`
- `src/app/features/planned-actions/pages/planned-actions-page/planned-actions-page.html`
- `src/app/features/planned-actions/store/planned-actions.store.ts`
- `src/app/shared/components/app-pagination/app-pagination.html`

### What changed

- Added consistent `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` to result-count text.
- Added result-count labels to the incidents explorer store.
- Expanded admin incident result labels so they announce loading, refreshing, error, and final count states.
- Expanded planned action result labels so they announce loading, refreshing, error, and final count states.
- Changed the incidents explorer result count so it always renders meaningful text, including zero results and errors.
- Updated the admin metric copy from `Filtered incidents` / `Total incidents` to `Filtered incident results` / `Total incident results`.
- Added live status semantics to the shared pagination summary.

### Why this was done

Result counts change after filtering, searching, pagination, loading, and errors. Sighted users can see the list update. Screen-reader users need that same update announced.

Before this change, some result counts only appeared when the total was greater than zero. That means `0 results` could be visually handled elsewhere but not consistently announced as a count change.

The new labels make each state explicit:

- `Loading incident results.`
- `Refreshing incident results.`
- `Incident results could not be loaded.`
- `0 incident results found.`
- `1 incident result found.`
- `12 incident results found.`

Using `aria-atomic="true"` matters because result messages are short but dynamic. It asks assistive technology to announce the whole message instead of only the part of the text node that changed.

## Commit `59f6213` - `fix status label announcements`

### Files changed

- `src/app/features/incident-detail/pages/incident-detail-page/incident-detail-page.ts`

### What changed

- Added the missing `NEW` status label to the `INCIDENT_STATUS_LABELS` map.

### Why this was done

The production build failed because `IncidentStatus` includes `NEW`, but the new label map did not include it. TypeScript caught this because the map was typed as `Record<IncidentStatus, string>`.

That strict typing is useful. It means whenever the app has a possible incident status, the accessibility announcement map must also have a readable label for it.

The fix added:

```ts
NEW: 'New',
```

After this fix, `pnpm build` passed.

## Accessibility Concepts Used

### Accessible labels

Accessible labels tell assistive technology what a control is. Examples from these commits include:

- `Upload evidence image files`
- `Incident status`
- `Incident priority`
- `Remove uploaded evidence image <filename>`

Good labels should be specific. `Apply` is weaker than `Apply status` because it does not explain what will be applied.

### Live regions

Live regions announce changes that happen without moving focus. They are useful for async updates, validation feedback, result counts, uploads, and save confirmations.

These commits use:

```html
role="status" aria-live="polite" aria-atomic="true"
```

Use this for non-urgent updates.

They also use:

```html
role="alert"
```

Use this for errors or urgent feedback.

### Text alternatives

Images need useful text alternatives when they communicate content. In the upload flow, uploaded evidence images are meaningful, so the alt text should explain that they are evidence images instead of only exposing a raw filename.

Decorative icons should not be announced, so they use:

```html
aria-hidden="true"
```

### Why changes were separated into commits

Each commit focuses on one accessibility concern:

- Image upload feedback and text alternatives.
- Status update announcements and notification semantics.
- Result count announcements.
- Build fix for complete status labels.

Small focused commits make the work easier to review, understand, test, and revert if needed.

## Verification

The production build was run with:

```sh
pnpm build
```

The first build caught the missing `NEW` status label. After the fix commit, the build passed.

The final build still showed existing CommonJS warnings for `ngeohash` and `leaflet`. Those warnings are unrelated to these accessibility changes.
