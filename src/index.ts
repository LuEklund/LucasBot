import { Service } from "@/service";
import { Events, ActivityType, TextChannel } from "discord.js";
import mongoose from "mongoose";
import { Quest } from "./quest";
import { Command } from "./commands";
import { Globals } from "./globals";
import { client } from "./client";
import { env } from "./env";

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");

    (async () => {
        Globals.CHANNEL = (await client.channels.fetch(env.QUEST_CHANNEL_ID)) as TextChannel;

        await Service.load(client);
        await Service.start(client);
        await Quest.load();
        await Command.load();
    })();

    await Service.stop(client);
});

client.login(env.BOT_TOKEN);
