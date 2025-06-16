# LucasBot

LucasBot is a **TypeScript + [Bun](https://bun.sh)** powered Discord bot that sprinkles a light‑weight yet surprisingly addictive _RPG‑flavoured_ progression layer onto your Discord server. It ships with slash‑command mini‑games, XP & gold rewards, user‑driven quests, and handy role utilities – all persisted in **MongoDB Atlas**, so your hard‑earned loot never disappears when the host restarts.

> “A bot that will make you want to watch the globglogabgalab more!” – _original author_

LucasBot was designed for rapid iteration, minimal runtime overhead, and no‑friction deployment. Whether you are looking to gamify a small study group or add depth to a 10 000‑member community, you can spin up the bot in minutes and start earning 📈 XP.

---

## ✨ Features

| Category           | Command(s)                      | Description                                                                                                                                                                       |
| ------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🎲 **Mini‑games**  | `/diceplayer`                   | Competitive dice roll that awards XP & gold to the highest roller. Ties trigger a sudden‑death throw‑off.                                                                         |
| 🗺️ **Quests**      | `/createquest`, `/executequest` | Create narrative quests with branching outcomes. Quests support Markdown in descriptions, optional images, and dynamic rewards.                                                   |
| 💬 **Fun**         | `/globglogabgalab`, `/deeznuts` | A single‑slash gateway to everyone’s favourite library creature. Plays a random quote plus an Easter‑egg GIF... and a command featuring a random deceased meme called "Deez Nuts" |
| 📈 **Progression** | `/xp`, `/award`, `/escapejail`  | View personal stats or manually award XP & gold to a user or role. Includes leaderboard auto‑pagination.                                                                          |
| 🛡️ **Roles**       | `/role add/remove/list`         | Self‑assignable roles with optional level requirements and emoji icons.                                                                                                           |
| 🔧 **Utilities**   | `/ping`, `/pong`, `/uptime`     | Latency test, Easter‑egg reply, and how long the bot has been running.                                                                                                            |

All commands leverage Discord’s **interaction** model: autocomplete, context‑aware validation, and helpful ephemeral error messages. New commands automatically appear in the in‑client command list the moment you deploy.

> **Planned mini‑games:** Blackjack, Rock‑Paper‑Scissors, and Trivia (see Roadmap below).

---

## 📸 Screenshots / Demo GIFs

| Slash Command List                      | Dice Roll Result                | Quest Dialog                        |
| --------------------------------------- | ------------------------------- | ----------------------------------- |
| ![commands list](docs/img/commands.png) | ![dice roll](docs/img/dice.gif) | ![quest dialog](docs/img/quest.png) |

> _Don’t see images?_ Clone the repo and open `docs/img/` locally.

---

## 🏗️ Tech Stack

| Layer                | Choice                        | Reason                                                                                                     |
| -------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Runtime**          | Bun 1.x                       | Ultra‑fast JS/TS engine with built‑in transpiler, test runner, and bundler – cold‑start ≈ 50 ms on Fly.io. |
| **Language**         | TypeScript 5.x                | Strict typing + modern ECMAScript features.                                                                |
| **Discord API**      | discord.js v14                | Slash‑command first & highly maintained.                                                                   |
| **Database**         | MongoDB Atlas via Mongoose v8 | Flexible documents for user stats and quest definitions; free tier is plenty for small servers.            |
| **Task Scheduler**   | node‑cron                     | Runs daily XP decay job and weekly leaderboard reset.                                                      |
| **Linting & Format** | ESLint · Prettier             | Consistent code style with pre‑commit hooks via Husky.                                                     |
| **CI / CD**          | GitHub Actions                | Runs lint, type‑check, unit tests, and optional auto‑deploy to Fly.io or Railway.                          |

---

## 🚀 Quick Start (Development)

```bash
# 1. Clone the repo
$ git clone https://github.com/<your‑org>/LucasBot.git
$ cd LucasBot

# 2. Install dependencies (≈ 1 s ☕) – Bun is blazing‑fast
$ bun install

# 3. Copy & populate environment vars
$ cp .env.example .env
#   BOT_TOKEN          – Discord bot token (from the Developer Portal)
#   MONGO_URI          – MongoDB connection string
#   QUEST_CHANNEL_ID   – Text channel where quest logs are posted
#   DEV_GUILD_ID       – (optional) Single guild to register commands in during dev

# 4. Run in watch‑mode (hot reloads on file change)
$ bun run dev
```

When the bot starts it will:

1. Log in to Discord and print the invite URL in the console.
2. Register slash‑commands _globally_ (or to `DEV_GUILD_ID` if set) – propagation takes \~1 h globally, <1 s per guild.
3. Connect to MongoDB and seed an **admin** user document for the bot owner.

Press <kbd>Ctrl +C</kbd> to stop. All in‑memory cooldown timers are persisted before exit.

---

## 🔧 Configuration Deep‑Dive

| Variable           | Type   | Default             | Purpose                                                 |
| ------------------ | ------ | ------------------- | ------------------------------------------------------- |
| `BOT_TOKEN`        | string | —                   | Discord bot token – keep it secret!                     |
| `MONGO_URI`        | string | mongodb://localhost | Connection string incl. credentials.                    |
| `QUEST_CHANNEL_ID` | string | —                   | Channel ID where the bot posts quest narratives.        |
| `XP_PER_MESSAGE`   | number | 5                   | Passive XP for each user message (anti‑spam throttled). |
| `GOLD_PER_LEVEL`   | number | 100                 | Gold awarded when a user levels up.                     |
| `ADMIN_ROLE_ID`    | string | —                   | Optional role ID that bypasses quest cooldowns.         |

You can override any env var at runtime: `XP_PER_MESSAGE=2 bun run dev`.

---

## 🐚 CLI Scripts

```bash
bun run dev          # dev server with watch
bun run build        # transpile to dist/
bun run start        # production mode (uses dist/) – set NODE_ENV=production
bun run lint         # ESLint
bun run test         # Bun test runner
```

## ✅ Test Results

```bash
$ bun test
 44 pass
 0 fail
 70 expect() calls
Ran 44 tests across 17 files. [506.00ms]
```

---

## ⛴️ Deployment Recipes

### Fly.io (recommended ‑ free tier)

```bash
fly launch --dockerfile Dockerfile.fly
fly secrets set BOT_TOKEN=… MONGO_URI=… QUEST_CHANNEL_ID=…
fly deploy
```

Fly’s ephemeral VMs spin up in <200 ms, making them perfect for Bun.

### Railway

1. Click **Deploy on Railway** button in the repo.
2. Add the required environment variables.
3. The production image uses `bun run start`.

### Docker Compose

```yaml
services:
    lucasbot:
        image: oven/bun:latest
        volumes:
            - ./:/app
        working_dir: /app
        command: ["bun", "run", "start"]
        environment:
            BOT_TOKEN: ${BOT_TOKEN}
            MONGO_URI: ${MONGO_URI}
            QUEST_CHANNEL_ID: ${QUEST_CHANNEL_ID}
```

> **Note:** Bun’s image is \~60 MB – half the size of Node 18‑alpine.

---

## 🔐 Security & Permissions

- The bot only requests the **applications.commands** and **bot** scopes.
- Required bot permissions: `Send Messages`, `Embed Links`, `Read Message History`, `Add Reactions`, `Use Slash Commands`.
- It does _not_ require `Administrator`.
- All database credentials are loaded from environment variables; no secrets in code.

---

## 🗄️ Project Layout

```
src/
├─ commands/        # each file exports a SlashCommandBuilder + execute()
│  └─ admin/        # high‑privilege commands (award, reload‑quests)
├─ models/          # Mongoose schemas (User, Quest, Cooldown)
├─ services/        # business logic (XP maths, quest engine, scheduler)
├─ utils/           # typed helper functions (logger, random, embeds)
├─ quests/          # sample quest JSON scripts
└─ index.ts         # entry point – bootstraps Client & registers handlers
```

---

## 📚 Command Reference (Core)

| Command              | Scope | Cooldown  | Description                              |
| -------------------- | ----- | --------- | ---------------------------------------- |
| `/diceplayer`        | guild | 15 s      | Roll a D100; highest roll wins XP+gold.  |
| `/xp [user]`         | guild | none      | Show XP, level, gold, rank.              |
| `/createquest`       | DMs   | 5 min     | Wizard to assemble a quest from prompts. |
| `/executequest <id>` | guild | per‑quest | Run a quest and collect choices.         |
| `/role add <name>`   | guild | 30 s      | Self‑assign a configured role.           |
| `/ping`              | guild | 5 s       | Returns “Pong!” plus latency.            |

For the full list: `/help` or see `docs/COMMANDS.md` (generated).

---

## 🧑‍💻 Contributing

We welcome PRs of _any_ size – from typo fixes to new mini‑games.

1. **Fork** the repo & create a feature branch.
2. `bun prettier --write .` before committing.
3. Push & open a **draft PR** early for feedback.
4. All checks (lint, type‑check, unit tests) must pass before review.
5. PRs that change commands _must_ update `docs/COMMANDS.md` (run `bun run docs`).

### 🌟 Contributor Rewards

Contributors earn in‑repo XP! A GitHub Action awards 🟡 _gold stars_ to merged PR authors – purely for bragging rights.

---

## 🗺️ Roadmap

- [x] XP & Level system
- [x] Quest engine with branching storylines
- [ ] Blackjack mini‑game _(in progress)_
- [ ] Trivia mini‑game with OpenTDB integration
- [ ] In‑bot marketplace to spend gold on custom roles & badges
- [ ] Web dashboard (Next.js) for configuring quests visually

> Vote on features in [Discussions → Ideas](https://github.com/<your‑org>/LucasBot/discussions).

---

## ❓ FAQ

**Q: Does LucasBot work on self‑hosted Discord forks?**
A: Not officially – only the canonical Discord API is supported.

**Q: Can I run the bot with Node instead of Bun?**
A: Yes! Replace `bun install` with `npm ci` and `bun run` with `npm run`. Cold‑start will be slightly slower.

**Q: Is the database strictly required?**
A: Yes – without MongoDB the bot cannot persist XP or quests. In‑memory fallback is not planned.

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for full text.

---

## 🙏 Credits

Original project by **Lucas** and awesome contributors.
Special thanks to the Discord.js, Bun, and MongoDB teams for their stellar open‑source work.

> ❤️ If you build something cool with LucasBot, let us know in the Discussions board!
