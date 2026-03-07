# DUTLOK Architecture

## Stack Justification

### Next.js 14 (App Router)
- **Why**: Monolith approach — SSR pages, API routes, and server components in one codebase. No need for a separate backend for a guild-sized app (~50-200 characters).
- **Alternative considered**: Separate Express + React SPA. Rejected because it doubles deployment complexity for no benefit at this scale.

### SQLite (via better-sqlite3)
- **Why**: Zero-ops database. No server to manage, no connection pooling needed. Single-file database that can handle millions of rows — far more than a guild will ever need.
- **Alternative considered**: PostgreSQL. Rejected because it adds operational overhead (server, backups, connection management) that isn't justified for a single-guild tool.
- **Migration path**: Drizzle ORM supports PostgreSQL, so migration is straightforward if scale demands change.

### Drizzle ORM
- **Why**: Lightweight, type-safe, excellent SQLite support. Schema defined in TypeScript with full inference. No heavy runtime like Prisma.
- **Alternative considered**: Prisma. Rejected due to heavier runtime, slower cold starts, and more complex migration workflow for a simple app.

### Tailwind CSS
- **Why**: Utility-first CSS that produces small bundles and enables rapid UI development. Dark mode built-in. No custom CSS framework to maintain.

## Data Model

### Core Entities
- **guild_members**: Real people (players). Optional — characters can exist without a linked member.
- **characters**: WoW characters. Core entity. Linked to members via `member_id`.
- **character_profiles**: Detailed snapshot data (stats, gear, talents, professions). 1:1 with character, replaced on each sync.
- **sync_jobs**: Tracks sync operations for observability.
- **raid_teams**: Named groups for organizing characters.
- **audit_log**: Records admin actions.

### Key Design Decisions
1. **Denormalized character data**: Class, spec, role, ilvl stored directly on the character row for fast queries. Detailed data in JSON columns on character_profiles.
2. **JSON columns for API data**: Equipment, talents, professions stored as JSON. This data is complex and varies by class. Normalizing it would add dozens of tables for minimal query benefit.
3. **Single profile row per character**: We overwrite on each sync rather than keeping history. Historical snapshots can be added later by inserting new rows instead of updating.

## Sync Architecture

### Flow
1. **Guild Import**: `GET /data/wow/guild/{realm}/{guild}/roster` — pulls all guild members with basic info.
2. **Character Sync**: For each character, parallel-fetches profile, equipment, stats, media, professions, M+ rating, PvP summary.
3. **Rate Limiting**: 100ms delay between character syncs. Blizzard allows 36,000 requests/hour per client.

### Error Handling
- Each API endpoint is called independently with error isolation (`safeCall` pattern).
- If one endpoint fails (e.g., M+ data for a character who hasn't done keys), other data still saves.
- Sync jobs track total/processed/failed counts.

## Auth Model (v1)
- Simple admin password via `ADMIN_PASSWORD` env var.
- Checked on every admin API call.
- No session management — password sent with each request.
- Designed to be replaceable with Blizzard OAuth or JWT sessions later.

## Caching Strategy
- Character data cached in SQLite with `last_synced_at` timestamps.
- UI reads from database, never directly from Blizzard API.
- Sync triggered manually or via scheduled job.
- Blizzard OAuth token cached in memory with expiry tracking.

## Deployment
- Single Node.js process serving both SSR pages and API routes.
- SQLite database file in `./data/dutlok.db`.
- Can run on any VPS, Docker container, or platform that supports Node.js.
- No external services required beyond Blizzard API.
