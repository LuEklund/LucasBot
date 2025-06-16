import { Service } from "@/service";
import { Client, GatewayIntentBits, Partials, Events, ActivityType, TextChannel } from "discord.js";
import mongoose from "mongoose";
import { Quest } from "./quest";
import { Command } from "./commands";

// Stats emoji
// Global link AKA Lucas's yt
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
            value: "Agility",
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
            name: "Charisma",
            value: "charisma",
            emoji: "💰",
        },
        xp: {
            name: "Charisma",
            value: "charisma",
            emoji: "🌟",
        },
        skillpoint: {
            name: "Charisma",
            value: "charisma",
            emoji: ":bulb:",
        },
        items: {
            name: "Charisma",
            value: "charisma",
            emoji: "📦",
        },
        level: {
            name: "Charisma",
            value: "charisma",
            emoji: ":arrow_up:",
        },
    };

    export const LINK: string = "https://www.youtube.com/@LucasDevelop";
    export let CHANNEL: TextChannel;

    export function random(max: number, min: number = 0): number {
        return Math.floor(Math.random() * (max - min) + min);
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

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

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

client.login(process.env.BOT_TOKEN);
