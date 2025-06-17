import { Service } from "@/service";
import { Events, ActivityType, TextChannel } from "discord.js";
import mongoose from "mongoose";
import { Quest } from "./quest";
import { Command } from "./commands";
import { Globals } from "./globals";
import { client } from "./client";

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
