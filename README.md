# LucasBot

holy shit another discord bot? yeah but this one actually doesnt suck (maybe)

LucasBot is some **TypeScript + [Bun](https://bun.sh)** discord bot that turns your server into a shitty RPG because apparently we need more gamification in our lives. it has slash commands, fake internet points (XP), and mongodb because we're fancy like that

> "bro this bot made me touch grass... just kidding i still haven't" - some guy probably

Built for people who want to procrastinate but make it look productive. Works on servers with 3 people or 10000 people who never talk anyway

---

## ✨ Features (aka the good shit)

**🎲 Mini-games**
- `/diceplayer` - roll dice like its 2003, highest number wins fake gold, ties = sudden death because drama

**🗺️ Quests** 
- `/createquest` `/executequest` - make up some bullshit story with branching paths, supports markdown because we're not animals

**💬 Fun commands**
- `/globglogabgalab` - the superior meme, plays random quotes + gifs
- `/deeznuts` - gottem (rip to a real one)

**📈 Progression shit**
- `/xp` - check your meaningless internet points
- `/award` - give people fake currency 
- `/escapejail` - wait what

**🛡️ Roles**
- `/role` - self assign roles like a civilized human being

**🔧 Utilities**
- `/ping` `/pong` `/uptime` - the holy trinity of "is this thing working"

All commands use discord interactions so you get those fancy autocomplete dropdowns and shit. absolutely no bugs at all™

---

## 📸 Screenshots

| Commands | Dice Rolling | Quest Stuff |
|----------|-------------|-------------|
| ![commands](docs/img/commands.png) | ![dice](docs/img/dice.gif) | ![quest](docs/img/quest.png) |

if you dont see images then git clone this shit and look at docs/img like a normal person

---

## 🏗️ Tech Stack (buzzword bingo)

- **Runtime**: Bun because nodejs is for boomers
- **Language**: TypeScript because we pretend to be professional  
- **Discord**: discord.js v14 because v13 is cringe
- **Database**: MongoDB Atlas because we like our data unstructured like our lives
- **Cron**: node-cron for scheduled depression
- **Linting**: ESLint + Prettier because we have standards (sort of)
- **CI/CD**: GitHub Actions because manual deployment is for cavemen

---

## 🚀 Quick Start (ez mode)

```bash
# clone this garbage
git clone https://github.com/yourname/LucasBot.git
cd LucasBot

# bun install goes brrrr
bun install

# copy the env file and fill out your secrets
cp .env.example .env
# BOT_TOKEN - get this from discord dev portal
# MONGO_URI - mongodb connection string  
# QUEST_CHANNEL_ID - where quest spam goes
# DEV_GUILD_ID - test server id (optional)

# run it
bun run dev
```

bot will start up and spam console with startup messages. ctrl+c to kill it when you get bored

---

## 🔧 Config vars

| Variable | Type | Default | What it does |
|----------|------|---------|-------------|
| `BOT_TOKEN` | string | - | discord bot token (dont leak this you donkey) |
| `MONGO_URI` | string | mongodb://localhost | database connection |
| `QUEST_CHANNEL_ID` | string | - | where quest logs go |
| `XP_PER_MESSAGE` | number | 5 | passive xp gain |
| `GOLD_PER_LEVEL` | number | 100 | gold when you level up |
| `ADMIN_ROLE_ID` | string | - | bypass cooldowns like a chad |

---

## 🐚 Scripts

```bash
bun run dev      # development mode with hot reload
bun run build    # compile typescript 
bun run start    # production mode
bun run lint     # check your shitty code
bun run test     # run tests (spoiler: there are like 3)
```

---

## ⛴️ Deployment (making it someone else's problem)

### Fly.io (free tier gang)

```bash
fly launch --dockerfile Dockerfile.fly
fly secrets set BOT_TOKEN=xxx MONGO_URI=xxx QUEST_CHANNEL_ID=xxx
fly deploy
```

### Railway 
click the deploy button, add env vars, pray it works

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

---

## 🔐 Security

bot needs these permissions:
- Send Messages
- Embed Links  
- Read Message History
- Add Reactions
- Use Slash Commands

does NOT need admin perms (we're not that stupid)

---

## 🗄️ Project Structure

```
src/
├─ commands/     # slash commands go here
│  └─ admin/     # admin only commands
├─ models/       # mongoose schemas
├─ services/     # business logic (lol)
├─ utils/        # random helper functions
├─ quests/       # quest json files
└─ index.ts      # main entry point
```

---

## 📚 Commands

| Command | Cooldown | Description |
|---------|----------|-------------|
| `/diceplayer` | 15s | roll d100, highest wins |
| `/xp [user]` | none | check stats |
| `/createquest` | 5min | make a quest |
| `/executequest` | varies | run a quest |
| `/role add` | 30s | self assign role |
| `/ping` | 5s | pong |

---

## 🧑‍💻 Contributing

PRs welcome, just dont break everything

1. fork the repo
2. make your changes
3. run prettier so your code doesnt look like ass
4. open a PR
5. wait for review (might take a while)

---

## 🗺️ Roadmap

- [x] XP system
- [x] Quest engine  
- [ ] Blackjack (in progress, probably broken)
- [ ] Trivia game
- [ ] Shop system to spend fake money
- [ ] Web dashboard (because CLIs are scary)

---

## ❓ FAQ

**Q: Does this work?**
A: Sometimes

**Q: Can I use Node instead of Bun?**
A: Yeah but why would you want to be slow

**Q: Is MongoDB required?**
A: Yes, we need somewhere to store your disappointment

---

## 📝 License

MIT License because we dont give a shit what you do with this

---

## 🙏 Credits

Made by Lucas and other people who contributed stuff

shoutout to discord.js, bun, and mongodb for making this possible

> if you actually use this bot let us know so we can laugh at your life choices
