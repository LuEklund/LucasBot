import { Client, GatewayIntentBits, Partials, Events, TextChannel, REST, Routes } from "discord.js";
import mongoose from "mongoose";
import { Service } from "@/service";
import { Quest } from "./quest";
import { Command } from "./commands";
import { GlobalFonts } from "@napi-rs/canvas";

export namespace Globals {
    export const ATTRIBUTES = {
        strength: {
            name: "Strength",
            value: "strength",
            emoji: "💪",
        },
        defense: {
            name: "Defense",
            value: "defense",
            emoji: "🛡️",
        },
        agility: {
            name: "Agility",
            value: "agility",
            emoji: "💨",
        },
        magicka: {
            name: "Magicka",
            value: "magicka",
            emoji: "🔮",
        },
        vitality: {
            name: "Vitality",
            value: "vitality",
            emoji: "❤️",
        },
        stamina: {
            name: "Stamina",
            value: "stamina",
            emoji: "🔋",
        },
        charisma: {
            name: "Charisma",
            value: "charisma",
            emoji: "🔥",
        },
        gold: {
            name: "Gold",
            value: "gold",
            emoji: "💰",
        },
        xp: {
            name: "XP",
            value: "xp",
            emoji: "🌟",
        },
        skillpoint: {
            name: "Skillpoint",
            value: "skillpoint",
            emoji: "💡",
        },
        item: {
            name: "Item",
            value: "item",
            emoji: "📦",
        },
        level: {
            name: "Level",
            value: "level",
            emoji: "⬆️",
        },
        health: {
            name: "Health",
            value: "health",
            emoji: "❤️",
        },
        mana: {
            name: "Mana",
            value: "mana",
            emoji: "🔵",
        },
    };

    export const LINK: string = "https://www.youtube.com/@LucasDevelop";
    export let CHANNEL: TextChannel;
    export const MISSING_PERMS = "You don't have the right permissions to execute this command";

    export function random(min: number, max: number = 0): number {
        if (min > max) return min;
        return Math.floor(Math.random() * (max - min) + min);
    }
    export function randomFloat(min: number, max: number = 0): number {
        if (min > max) return min;
        return Math.random() * (max - min) + min;
    }
}

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.User],
});

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("Invalid bot token");

client.once(Events.ClientReady, async (readyClient) => {
    GlobalFonts.registerFromPath("./assets/fonts/Bangers-Regular.ttf", "Bangers");
    console.log(`${new Date().toISOString()} Bot connected as '${readyClient.user.tag}'`);

    await mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/mydiscordapp");
    console.log("Connected to MongoDB");

    (async () => {
        if (!process.env.QUEST_CHANNEL_ID) throw new Error("QUEST_CHANNEL_ID is not defined in .env");
        Globals.CHANNEL = (await client.channels.fetch(process.env.QUEST_CHANNEL_ID)) as TextChannel;

        await Service.load(client);
        await Service.start(client);
        await Quest.load();
        await Command.load();
    })();

    await Service.stop(client);
});

await client.login(token);

const rest = new REST().setToken(token);

const allowed = [...Command.commands.keys()]; // allowed command names
const guilds = client.guilds.cache;

for (const [guildId, guild] of guilds) {
    const guildCommands = await guild.commands.fetch();

    for (const [_, command] of guildCommands)
        if (!allowed.includes(command.name)) await rest.delete(Routes.applicationGuildCommand(client.user?.id || "", guildId, command.id));
}
