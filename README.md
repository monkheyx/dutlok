# DUTLOK - Guild Dashboard

A private World of Warcraft guild roster and analytics platform. Built with Next.js, SQLite, and the Blizzard Battle.net API.

## Features

- **Guild Roster** — View all guild characters with class, spec, role, item level, and status
- **Character Profiles** — Detailed view of gear, stats, talents, professions, and M+ rating
- **Filtering & Search** — Filter by class, spec, role, main/alt, raid team; sort by any column
- **Guild Analytics** — Class/spec/role distribution, armor type coverage, composition summaries
- **Data Sync** — Import roster from Blizzard API, refresh individual or all characters
- **Admin Panel** — Password-protected admin actions for managing roster and triggering syncs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| API | Blizzard Battle.net API |

## Quick Start

### Prerequisites

- Node.js 18+
- A Blizzard API application ([create one here](https://develop.battle.net/))

### Setup

```bash
# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env

# Initialize the database
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `BLIZZARD_CLIENT_ID` / `BLIZZARD_CLIENT_SECRET` — From your Battle.net developer app
- `BLIZZARD_REGION` — `us`, `eu`, `kr`, or `tw`
- `GUILD_REALM` — Your realm in slug format (e.g., `area-52`, `illidan`)
- `GUILD_NAME` — Your guild name (e.g., `My Guild Name`)
- `ADMIN_PASSWORD` — Password for admin actions

### First Run

1. Start the dev server: `npm run dev`
2. Go to `/admin`
3. Enter your admin password
4. Click "Import Guild Roster" to pull your guild from Blizzard
5. Click "Sync All Characters" to fetch detailed profiles
6. Visit the Dashboard and Roster pages

## Project Structure

```
src/
  app/              # Next.js pages and API routes
    api/            # REST API endpoints
    admin/          # Admin panel
    analytics/      # Guild analytics page
    character/[id]/ # Character detail page
    roster/         # Roster listing page
  components/       # React components
  db/               # Database schema and setup
  lib/              # Utilities, queries, WoW data
  services/         # Blizzard API client, sync logic
```

## API Endpoints

- `GET /api/characters` — List all characters
- `POST /api/characters` — Add a character (admin)
- `GET /api/characters/:id` — Get character with profile
- `PATCH /api/characters/:id` — Update character metadata (admin)
- `DELETE /api/characters/:id` — Remove a character (admin)
- `POST /api/sync` — Trigger sync actions (admin)
  - `action: "import_guild"` — Import full guild roster
  - `action: "sync_all"` — Refresh all character profiles
  - `action: "sync_character"` — Refresh a single character

## Deployment

For production:

```bash
npm run build
npm start
```

The app runs as a single Node.js process with an embedded SQLite database. No external database server needed.

## Future Enhancements

- Blizzard OAuth login for guild members
- Discord identity linking
- Raid team assignment and attendance
- Historical snapshots of gear/talent changes
- Character comparison tool
- CSV export
- Dark/light mode toggle
- Scheduled background sync via cron
