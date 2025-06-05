import { Client, GatewayIntentBits, Events } from "discord.js";
import mongoose from "mongoose";
import { giveXP, UserModel } from "./models/user";
import { BotServices } from "@/services/botServices";
import { CommandService } from "@/services/commandService";

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

async function handleMessageCreate(message: any) {
    let dbUser = await UserModel.findOne({ id: message.author.id });

    if (dbUser) {
        if (dbUser.username !== message.author.username) {
            dbUser.username = message.author.username;
            await dbUser.save();
        }
        //Message rewards xp
        const currentTime = new Date();
        const timeDifferenceMs =
            currentTime.getTime() - dbUser.lastXpMessageAt.getTime();
        const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
        if (timeDifferenceMinutes >= 1) {
            giveXP(dbUser.id, 1);
            dbUser.lastXpMessageAt = currentTime;
            await dbUser.save();
        }
    } else {
        dbUser = await UserModel.create({
            id: message.author.id,
            username: message.author.username,
        });
    }
}

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");

    const services = new BotServices(client);
    services.start();

    const commandService = new CommandService(client);
    await commandService.start();

    client.on(Events.MessageCreate, async (message) => {
        await handleMessageCreate(message);
    });
});

client.login(process.env.BOT_TOKEN);
