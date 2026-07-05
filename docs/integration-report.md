# PAPPY Project Phase 2 Integration Report

## Scope inspected
- PAPPY OS repo files, dependencies, API endpoints, UI layers, in-memory schedules, simulated WhatsApp/PFP flows, Gemini endpoint, Vite build path, and deployment surface.
- The requested upstream bot repositories are external service boundaries for this repo. This phase adds stable adapters, persistence, realtime telemetry, and deployment contracts without rewriting existing bot logic.

## Current state
- Frontend: React/Vite with three layers: guest media, PFP center, and WhatsApp bot dashboard.
- Backend: Express server with Gemini, media gallery/downloader, PFP scheduling/upload endpoints, WhatsApp bot status/log/action endpoints.
- Data before this change: volatile process memory only.
- Auth before this change: UI-only GitHub/magic-link simulations.

## Integration architecture
```text
Frontend (existing UI)
  -> Backend API (Express)
  -> Auth boundary (GitHub/full bot, guest/PFP limited)
  -> Bot Manager adapters (PFP bot + WhatsApp bot)
  -> Persistent state store / future DB
  -> Scheduler + session cleanup
  -> Logging + WebSocket realtime telemetry
  -> VPS process manager / reverse proxy
```

## Bot service contract
The existing bots should remain standalone engines and expose an adapter layer instead of being copied into the website:

### PFP bot adapter
- `pair(phone, method)` returns pairing code/QR updates.
- `updateProfilePicture(sessionId, imageBuffer, metadata)` reuses the existing image and Baileys profile update logic.
- `logout(sessionId)` disconnects and removes credentials.
- `cleanup(sessionId)` deletes temporary uploads, cache, and orphan sessions.

### WhatsApp function bot adapter
- `pair(userId, phone)` starts owner-specific Baileys session.
- `status(userId)` returns connection, avatar, groups, users, runtime, CPU, memory.
- `action(userId, restart|reconnect|logout|purge)` controls only that user's session.
- `logs(userId)` streams command, warning, error, and connection events.

## Security model
- Guest access can use one-time PFP and media features.
- Registered access can create schedules.
- GitHub-authenticated owner access controls full WhatsApp bot dashboard.
- Server adds baseline security headers, CORS allowlist support, JSON body limits, and IP rate limiting.
- No secrets are committed; `.env.example` lists required production variables.

## Persistence and restart behavior
- Runtime state now persists to `PAPPY_DATA_DIR/state.json` by default.
- Corrupted state files are quarantined on boot.
- Logs, bot status, and schedule metadata recover after VPS restarts.
- Image payloads are intentionally not persisted in schedule metadata to reduce privacy risk until encrypted object/file storage is wired.

## Realtime behavior
- `/ws` streams log, stats, schedule, and PFP completion events.
- The dashboard consumes WebSocket updates and keeps REST polling as a fallback.

## Next integration step
Clone the two bot repos on the VPS beside this app and implement adapter modules that call their existing exported pairing/session/profile functions. Do not move bot credentials into the web repo; mount bot session directories under `PAPPY_DATA_DIR/sessions` and encrypt or permission-lock them.

## Service wiring added after review
This repo now includes runtime connectors for both external bots. The website calls the configured service first and falls back to the local simulator only when a service URL/token is missing or unavailable.

### Required environment per bot
- PFP bot: `PFP_BOT_API_URL`, `PFP_BOT_API_TOKEN`, `PFP_BOT_OWNER_ID`.
- WhatsApp bot: `WHATSAPP_BOT_API_URL`, `WHATSAPP_BOT_API_TOKEN`, `WHATSAPP_BOT_OWNER_ID`.

Each bot has its own token and owner identifier. The backend forwards those separately as `Authorization: Bearer <token>` and `X-Pappy-Owner`, so the PFP bot and the function bot do not share credentials or ownership scope.

### Expected adapter endpoints
- PFP service: `POST /pair`, `POST /profile-picture`.
- WhatsApp service: `GET /stats`, `POST /pair`, `POST /action`.

If the existing bot repos use different route names, add a tiny adapter inside each bot repo that maps these routes to their existing pairing/session functions instead of rewriting bot logic.
