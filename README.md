# Lucas Bot 🤖

An RPG bot where you can fight your friends or enemies with the help of items you acquire from the shop and quests.

## Some commands

`/help` - Shows general information and instructions.

`/profile` - Shows information about a user, like stats 🔮, inventory 📦, gold 💰, xp 🌟, levels ⬆️ and skill points 💡.

`/shop` - Buy items 📦, the shop contains 4 items 📦 and the shop restocks every 15 minutes ⏰.

`/fight` - Fight against another player for a bet which can be between 0 - 250 💰.

`/globglogabgelab` - Sends a nice song 😉.

`/xp top` - Shows the leaderboard 🏆 for xp 🌟.

`/gold top` - Shows the leaderboard 🏆 for gold 💰.

`/work` - Do some work to earn money... its very little I mean under 2 💰.

## Quests

There are quests that happen randomly every 30-ish minutes ⏰

Some quests can only a select amount of people participate meanwhile other quests have unlimited capacity.

Also avoid pressing the help button on the **Timmy** quest.

## For administrators

There are several command to for admins like

`/gold set`

`/gold add`

`/xp set`

`/xp add`

`/inventory add` - Gives an item 📦 to user.

`/quest start`

`/quest end`

## For devs

All PR's need to be tested, there are instructions some instruction in the [.env.example](.env.example)

Instructions on how to setup the bot, you can also follow this [video](https://www.youtube.com/watch?v=Oy5HGvrxM4o).

1. Go to the discord developer portal _[here](https://discord.com/developers/applications)_

2. Press on `New Application` in the top right and then give it a nice name!

3. Press on the bot in the applications panel.

4. Now you can go to the `OAuth2` tab on the left side, now under "Client Information", there is a button there to get the private bot token, keep in mind its private don't share it.

5. Now you need to create a mongo db, tho you can run it localy. Heres the link good luck ❤️! [MongoDB](https://www.mongodb.com/)

You can also run the bot thru Docker, keep in mind you might need to change [start-server.bash](start-server.bash) to pull from your fork instead of this repo.

Now to run the bot you need [Bun](https://bun.sh/).

Then run

```shell
bun install && bun run dev
```

## Lead Devlopers

[![Lucas](https://github.com/LuEklund.png?size=40)](https://github.com/LuEklund)
[![Harald](https://github.com/HaraldWik.png?size=40)](https://github.com/HaraldWik)
