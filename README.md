# FotMob Telegram Injury Bot

A NestJS-based Telegram bot that lets fantasy managers subscribe to FotMob player updates, automatically tracks injuries, and pings users ahead of fixtures so they can react before lineups lock.

## Key Features

- Telegraf-powered Telegram bot with `/start`, `/help`, and natural-language player lookups.
- Player ingestion pipeline that queries FotMob's public API and persists players, leagues, and fixtures in PostgreSQL through TypeORM.
- Puppeteer worker that refreshes the `x-mas` header every 2 hours to keep FotMob API calls authenticated.
- Scheduled tasks that re-check stored players for new injuries every 6 hours and notify all followers when an affected league has an upcoming fixture.
- Multi-user tracking: every player can be followed by multiple Telegram users; notifications fan out automatically.

## Tech Stack

| Layer           | Tools                                   |
| --------------- | --------------------------------------- |
| Runtime         | Node.js, NestJS, Telegraf               |
| Data            | PostgreSQL, TypeORM, migrations         |
| Automation      | `@nestjs/schedule` cron jobs, Puppeteer |
| Testing/Quality | Jest, ESLint, Prettier                  |

## Prerequisites

- Node.js 20+ and npm 10+ (aligns with the Nest 11 toolchain).
- PostgreSQL 14+ reachable from the app (local container or managed instance).
- A Telegram bot token from [@BotFather](https://core.telegram.org/bots/tutorial#obtain-your-bot-token).
- Chromium dependencies for headless Puppeteer (pre-installed on most macOS/Linux setups).

## Environment Variables

Create a `.env` file in the project root (the `ConfigModule` loads it automatically):

| Variable             | Description                                               | Example                                      |
| -------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Token issued by BotFather. Required for startup.          | `123456:ABC-DEF`                             |
| `DB_URL`             | PostgreSQL connection string consumed by TypeORM.         | `postgres://user:pass@localhost:5432/fotmob` |
| `NODE_ENV`           | Optional runtime hint (`development`, `production`, ...). | `development`                                |

> The data source also enables SSL with `rejectUnauthorized: false`. Disable or harden this if you control the DB environment.

## Setup

```bash
git clone https://github.com/<you>/fotmob-tg-bot.git
cd fotmob-tg-bot
npm install
```

### Database & Migrations

1. Ensure the database in `DB_URL` exists.
2. Run pending migrations:
   ```bash
   npm run migration:run
   ```
3. To rollback the latest batch:
   ```bash
   npm run migration:revert
   ```
4. To scaffold a new migration (uses `npm_config_name`):
   ```bash
   npm run migration:create --name=createUsersTable
   # or generate from the current schema
   npm run migration:generate --name=addPlayersIndexes
   ```

### Running the App

| Command              | Purpose                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| `npm run start:dev`  | Start Nest in watch mode. Launches the Telegram bot, Puppeteer worker, and cron jobs. |
| `npm run start`      | Start in production mode (no reload).                                                 |
| `npm run start:prod` | Run the compiled `dist/main.js`. Use after `npm run build`.                           |
| `npm run build`      | Compile TypeScript to `dist`.                                                         |

Keep the process alive (e.g., with PM2/systemd) in production so scheduled jobs continue to run.

## Scheduled Jobs

| Service                                | Schedule      | Description                                                                                          |
| -------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `PuppeteerService.getXmasToken`        | Every 2 hours | Opens fotmob.com, intercepts the `x-mas` header, caches it for API calls.                            |
| `PlayersService.updatePlayersInjuries` | Every 6 hours | Re-fetches stored players, updates injury status & expected return.                                  |
| `FixturesService.getFixtures`          | Every 6 hours | Looks ahead 24h for fixtures, notifies all subscribers for a league, and marks fixtures as notified. |

All cron expressions are defined in code; tweak them via `CronExpression` constants if needed.

## Telegram Bot Flow

1. `/start` – greets the user and explains the bot.
2. `/help` – short usage hint.
3. Any other message – treated as a player search term. The bot:
   - Looks up the player via FotMob.
   - Persists the Telegram user (if new) and associates them with the player + league.
   - Confirms tracking and stores metadata for future alerts.

Notifications arrive as formatted HTML messages enumerating every injured player that belongs to the league involved in an upcoming fixture.

## Data Model

| Entity    | Purpose                                                                                |
| --------- | -------------------------------------------------------------------------------------- |
| `User`    | Telegram user profile (`telegramId`, `name`) with a many-to-many relation to `Player`. |
| `Player`  | FotMob player metadata (IDs, team, injury info) plus owning `League`.                  |
| `League`  | FotMob competitions, backing both fixtures and players.                                |
| `Fixture` | Upcoming matches tied to a league, flagged once notifications are sent.                |

Refer to `src/**/entity/*.ts` for full definitions and column annotations.

## Testing & Linting

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `npm test`         | Run unit tests (Jest, `src/**/*.spec.ts`). |
| `npm run test:e2e` | Execute end-to-end tests in `test/`.       |
| `npm run lint`     | ESLint with the project config.            |
| `npm run format`   | Prettier over `src/` and `test/`.          |

## Troubleshooting

- **Bot fails to start:** verify `TELEGRAM_BOT_TOKEN` is set and valid; the service throws on boot otherwise.
- **DB connection errors:** confirm `DB_URL` is reachable from the host. For local Postgres inside Docker, expose port `5432` and include credentials.
- **Puppeteer errors:** install system dependencies (e.g., `apt install chromium` on Debian) or set `PUPPETEER_EXECUTABLE_PATH` to an existing Chrome binary.
- **Missing cron activity:** make sure the process stays alive; cron jobs run in-process and stop when the Nest app stops.

## License

`UNLICENSED` – see `package.json`. Update this section if you decide to open-source the project later.
