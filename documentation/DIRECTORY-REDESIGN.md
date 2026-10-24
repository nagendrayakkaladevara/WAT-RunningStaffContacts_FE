# WAT Contacts directory redesign

## Delivered

- Compact top navigation on desktop and bottom navigation on mobile, a spacious 1120px workspace, neutral shadcn tokens, warm dark mode, larger touch targets and reduced-motion support.
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


## Visual system

Source: [Nagendra’s design system v1.0.0](https://github.com/nagendrayakkaladevara/my-design-system-files/blob/main/design-system.md), reviewed from file SHA `21dbfe28657c682d2ec107f3f0363fdd92766455`.

- `src/index.css` maps the specification’s white canvas, #fafafa surfaces, custom warm OKLCH dark palette, typography and neutral actions to shadcn semantic variables. Essential field borders are darker than decorative borders for visibility.
- Geist Variable is bundled through `@fontsource-variable/geist` (OFL-1.1), including its license in the package; no external font service is contacted. Body weight is 430.
- The 1120px workspace follows the specification’s CRUD/list-detail extension. Page gutters are 24px, top padding is 40px on phones / 56px at 640px and above, and section spacing is 40px / 56px. The desktop navigation starts at 768px; phone navigation remains available below it.
- Shared Button, Card, Input, Checkbox, Dialog and Select primitives use the system’s neutral colors, 8–12px rounding and comfortable targets. Select uses Radix keyboard navigation, selection, dismissal and focus management. Cards are flat; shadows are reserved for overlays.
- Home uses a ChatGPT-inspired, centered search composer and a single heading. Category tiles, saved-contact sections, footer and mobile bottom navigation are absent on this route; all destinations are reachable from the shadcn navigation menu. Search keeps an accessible label, automatic/name/phone selection and separate clear/voice/search actions. Contact lists use dividers and initials rather than repeated raised cards. Long names wrap and actions are always visible.
- Category, documents, favorites, More, About and analytics pages share the same visual language. About no longer uses gradients, oversized headings or decorative animation.
- Visual/device acceptance remains pending: review both themes at 320, 390, 640, 768, 1024 and 1440px, enlarged text, long names, keyboard menus, dialog focus and mobile safe areas. DOM tests cover the search/filter behavior but are not a visual certification. Local Chromium launch was blocked by `socket() failed: Operation not permitted`.

## Mobile fixes and server configuration compatibility

The mobile dialog previously inherited Tailwind 4's independent `translate` property even when its `transform` was reset. Dialogs now use a fixed viewport grid for positioning, with an explicit `mobileSheet` prop. Bottom sheets are full width below 640px, scroll within the dynamic viewport and include safe-area padding; centering does not use CSS transforms. Dialog entry, search positioning, page entry and result fades use Motion with reduced-motion support. Mobile result spacing, empty dividers and duplicate filter/error notices are simplified.

The gateway accepts the previous `VITE_API_BASE_URL`, `VITE_API_KEY`, `VITE_API_USERNAME` and `VITE_API_PASSWORD` **only inside the server function** when the corresponding `WAT_API_*` variable is undefined. Explicitly empty new variables fail closed. Vite's browser environment prefix is now `PUBLIC_`, preventing legacy credential variables from being exposed through `import.meta.env`. This migration does not restore the deleted `.env` or put credentials into frontend code.

If requests still return 503, the deployed function has no usable configuration. In Netlify project configuration → Environment variables, set `WAT_API_BASE_URL` (the HTTPS backend origin), `WAT_API_KEY`, `WAT_API_USERNAME`, and `WAT_API_PASSWORD`. Enable the Functions scope and the required Production / Deploy Previews contexts, then redeploy. Function logs report missing **variable names only**, never values. Existing values that are only in a developer's local `.env` or scoped exclusively to Builds are not available to deployed functions. Rotate previously exposed credentials after migration. No production Netlify settings were changed by this PR.
