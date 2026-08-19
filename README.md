# ApplyIQ

## 1. Problem Statement
ApplyIQ helps students and job seekers organize opportunities, understand skill alignment, and measure job-search progress without requiring a backend account or service.

## 2. Functional Requirements
- Dashboard statistics calculated from saved applications.
- Create, edit, delete, and status/priority updates for applications.
- Search, combined filtering, and derived sorting.
- Transparent rule-based skill matching with readiness guidance.
- Deadline states, analytics, CSV export, light/dark theme, and sample data.
- Local validation, accessible responsive UI, and resilient localStorage fallback.

## 3. Non-Functional Requirements
The app is dependency-free, static-deployable, responsive, keyboard-friendly, readable, and organized around a single in-memory state with explicit persistence and rendering boundaries.

## 4. User Flow
Open the dashboard -> review metrics and applications -> add or inspect an opportunity -> refine the list with search/filter/sort -> edit progress as the process changes -> review analytics -> export a CSV snapshot.

## 5. Data Model
```js
{
  id, company, role, location, jobType, applicationDate, status,
  priority, deadline, applicationUrl, requiredSkills, notes,
  createdAt, updatedAt
}
```
Applications are stored as an array. Personal skills and theme preference are stored alongside it in the persisted state.

## 6. Application Architecture
Semantic HTML provides the UI shell. `script.js` separates constants/utilities, persistence, state mutation, matching and derived data, asynchronous job discovery, rendering, validation, and event delegation. A state change follows: validate -> mutate the state object -> save -> render -> notify. Discover Jobs keeps its fetched dataset transient and writes only saved opportunities into the existing persisted application state.

## 7. Module Responsibilities
- **State:** owns the single application state and controlled updates.
- **Persistence:** serializes, validates, loads, and clears localStorage data.
- **CRUD:** creates, retrieves, updates, and deletes records.
- **Matching:** normalizes skills and calculates matched/missing skills and score.
- **Derived data:** searches, filters, sorts, and calculates analytics.
- **Rendering:** updates dashboard metrics, list views, modal content, and settings.
- **Validation/utilities:** validates boundaries and centralizes dates, labels, escaping, and notifications.

## 8. State Management
The `state` object is the source of truth. The UI is derived from it; filtered and sorted arrays are copies and never replace the source collection.

## 9. LocalStorage Strategy
The `applyiq-state-v1` key stores JSON containing applications, personal skills, theme, and whether sample data has been shown. Loading catches parse failures, validates record fields, and falls back to safe defaults. Clearing sample data removes only seeded records; the reset action clears all app data.

## 10. Validation Strategy
Required text fields are trimmed and length checked. Enumerated fields are checked against centralized options. Dates must be valid ISO dates, required skills are normalized, and optional URLs must use `http` or `https`.

## 11. Error Handling
Storage access and JSON parsing are guarded. Invalid submissions keep the modal open and show inline messages. User-visible non-blocking feedback uses a toast region instead of intrusive alerts.

## 12. Testing Strategy
Manual acceptance testing covers CRUD, status and priority changes, search/filter/sort combinations, matching and readiness, statistics, deadlines, persistence, corrupted storage fallback, theme persistence, export, validation, and responsive layouts. Browser console errors should remain empty during these flows.

## 13. Deployment Strategy
This is a static site with relative paths. It can be hosted from the repository root on GitHub Pages or by dragging the folder into Netlify. No build step, server, or environment variables are required.

## Features
- Overview metrics for applications, interviews, selection, and match quality.
- Application pipeline with compact cards, deadline signals, and quick status updates.
- Explainable skill gap analysis for every opportunity.
- Analytics view with status distribution and recurring missing skills.
- Settings for personal skills, sample data, reset, theme, and CSV export.

## Discover Jobs

Discover Jobs retrieves live listings from the public Arbeitnow Job Board API at `https://www.arbeitnow.com/api/job-board-api`. The page uses the Fetch API with `async/await`; the fetch and `response.json()` calls are Promise-based, and `try/catch` plus `response.ok` validation keeps API failures from affecting the rest of the local workspace. The JSON `data` array is normalized and rendered into job cards, while search filters the retrieved dataset on the client without making a request for every keystroke.

Users can open a job in a new tab or save it to the existing application tracker. Saving maps the API title, company, location, URL, description, job types, and tags into the existing application object, then reuses the current CRUD, skill matching, toast, rendering, and localStorage flow. Jobs are checked by normalized application URL to prevent duplicates. If the API is unavailable, a friendly retry message is shown and the existing sample opportunities are displayed as a fallback.

## Technologies
HTML5, CSS3, modern Vanilla JavaScript (ES6+), localStorage, and browser download APIs.

## Project Structure
```text
ApplyIQ/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
```

## Run Locally
Open `index.html` directly in a modern browser, or serve the folder with any static server. For example, VS Code Live Server works without configuration.

## Deploy
- **GitHub Pages:** push the folder to a repository, then enable Pages for the main branch and root folder.
- **Netlify:** choose “Add new site” -> “Deploy manually” and upload the project folder.

## Testing
The implementation includes safe fallbacks and validation for the requested manual acceptance cases. Test with a fresh browser profile/localStorage, then use the Settings panel to clear samples or reset data.

## Known Limitations
Data is browser-local and does not sync between devices. There is no authentication, server backup, reminder notification, or external job-board integration. Match scores are exact normalized string comparisons, not semantic similarity.

## Future Improvements
Add optional encrypted account sync, calendar reminders, richer import formats, configurable matching aliases, and automated browser tests while keeping the static mode available.
