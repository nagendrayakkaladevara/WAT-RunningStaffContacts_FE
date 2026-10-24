# WAT Contacts directory redesign

## Delivered

- Mobile bottom navigation and desktop sidebar, compact branding, blue primary tokens, light/dark themes, larger touch targets and reduced-motion support.
- Unified name/phone search with auto detection, a manual override, 400 ms debounce, Enter submission and editable input during requests. Pending work is cancelled on query changes, clear and unmount; stale results cannot overwrite a newer search.
- Keyboard-accessible contact detail buttons, mobile detail sheets, call/copy feedback, favorites, native sharing/clipboard fallback and escaped vCard export.
- Favorites and recently viewed contacts stored locally as IDs plus phone lookup hints. Full contact records and blood groups are not persisted. Data is refreshed with the existing phone search route and matched by ID, so a reassigned number cannot silently show a different person. Recently viewed is not call history. Maximum 100 favorites and 12 recent IDs.
- One shared category/filter page with URL-backed applied filters and pagination, separate draft selections, removable chips, clear all, result counts and the backend's name A–Z order. The old blood-groups URL redirects here.
- Documents reuse one component with search, file-type filtering, title/update sorting, safe HTTP(S) links and actual backend update timestamps.
- Lazy secondary routes, install manifest/icons, home-screen guidance and an offline explanation. API responses and personal contact data are never service-worker cached.
- Same-origin Netlify gateway for the directory's existing read routes and visit increment only. Server credentials never enter the browser bundle. Administrative writes and unbounded contact export are not exposed by the gateway.

## Required before merging/deploying

Configure these variables in **Netlify's Functions scope**, for the production and desired deploy-preview contexts:

| Variable | Value |
| --- | --- |
| `WAT_API_BASE_URL` | HTTPS origin of the existing backend, without `/api` |
| `WAT_API_KEY` | Backend API key |
| `WAT_API_USERNAME` | Backend Basic Auth username |
| `WAT_API_PASSWORD` | Backend Basic Auth password |

The frontend now calls `/api/*`, rewritten to the Netlify Function. Missing server configuration intentionally returns a useful 503 error. Do not merge into an automatically deployed production branch until these variables are set. Never put secrets in `VITE_*` variables.

Remove the old `VITE_API_KEY`, `VITE_API_USERNAME`, and `VITE_API_PASSWORD` from build configuration. The tracked `.env` has been removed; rotate any credentials previously shipped in bundles or committed to Git. Deleting the file does not remove historical commits or rotate secrets.

The proxy maintains the app's existing public directory experience; it is not end-user authentication. It has an explicit route/method/query allowlist, upstream HTTPS enforcement, a timeout, sanitized errors, no-store responses and a Netlify per-IP rate-limit configuration. Staff-only access, if required, needs a user/session authorization design. The backend currently uses one shared credential pair for all operations; migrate to separate read and administrative permissions in the backend.

The backend currently rate-limits by IP at 100 requests/minute. Requests through a server gateway may share an egress IP. Review trusted-proxy configuration and rate-limit identity before a high-traffic rollout; do not blindly trust caller-supplied forwarding headers. Confirm Netlify rate-limit availability for the hosting plan. Monitor 429s in the deploy preview.

For local development, copy `.env.example` to an ignored `.env`, supply server values locally, and run `npx netlify dev`. Plain `npm run dev` renders the UI but does not run the gateway; use mocked API responses for isolated UI tests. Other hosts need an equivalent server gateway; this is no longer a static-only deployment.

## Backend reference and explicitly deferred work

Reviewed `WAT-RunningStaffContacts_BE` routes, controllers, Prisma schema, authentication and rate limiting. No backend changes or database migrations are included in this PR.

1. **Incorrect-number reports:** add a validated, rate-limited report submission endpoint, a persisted moderation queue, and an admin review/update workflow before exposing a submission UI. Reports must not directly mutate contact records.
2. **Verified status:** add a separately maintained `verifiedAt` field and authorized verification workflow. `updatedAt` is shown only as record update time and never labelled verified.
3. **Stable saved-contact refresh:** add a bounded get-by-IDs endpoint. The current backend has no `GET /contacts/:id`; phone-based refresh avoids relying on the frontend's pre-existing but unsupported service method. If a number changes, the old saved entry cannot be refreshed and must be re-saved from a new search.
4. **Document categories:** add category metadata and admin maintenance for domain-specific categories. The implemented type filter uses document-link extensions only.
5. **Address/notes:** details render these fields when supplied; the current Prisma Contact schema does not yet persist them.
6. **Additional sorting:** the backend currently returns names ascending (phone search uses phone order). Alternative global sorts need server support; no misleading current-page-only sort is added.

## Validation

Run `npm ci`, `npm run build`, `npm test -- --run`, and `npm run lint`.

Regression coverage includes debouncing, search-mode changes with unchanged text, request cancellation, clearing before a late response, filter application/page reset, keyboard detail access, phone/vCard handling, and gateway allowlist/credential isolation/error cases.

Manual deploy-preview checklist: 360/390/768/1440 px widths, light/dark mode, browser Back/Forward, search restoration through navigation, filter sheet apply/close, actual dialer and clipboard, voice permissions, sharing/vCard import, favorites refresh, documents, offline explanation, install prompt, and API 429/503 states.

Browser visual verification and live authenticated backend verification remain required before release. Local Chromium could not launch because the execution environment denies its socket operation, and the cloud browser could not reach the local dev server. Automated DOM interaction tests passed; they do not substitute for visual/device checks.
