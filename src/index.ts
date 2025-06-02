import type { Command } from "@/command";
import { Client, GatewayIntentBits, Events } from "discord.js";
import mongoose from "mongoose";
import { SuperUser, UserModel } from "./models/user";
import { Quest } from "./quest";
import { timeoutTracking } from "./system/timeoutSystem";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const commands = new Map<string, Command>();

async function registerCommands(client: Client) {
    const glob = new Bun.Glob("./src/commands/*.ts");

    for (const path of glob.scanSync(".")) {
        const { default: CommandClass } = await import(
            path.replace("./src/", "./")
        );
        const instance: Command = new CommandClass();
        const info = instance.info;
        commands.set(info.name, instance);
        client.application?.commands.create(info);
        console.log(`Registered command: ${info.name}`);
    }
}

async function handleCommandInteraction(client: Client, interaction: any) {
    const command = commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply("Command not found.");
    }

    try {
        await command.executeCommand(client, interaction);
    } catch (err) {
        console.error(`Error running command ${interaction.commandName}:`, err);
        interaction.reply("Error executing command.");
    }
}

async function handleAutocompleteInteraction(client: Client, interaction: any) {
    const command = commands.get(interaction.commandName);
    if (!command) {
        interaction.respond([]);
        return;
    }
    try {
        await command.executeAutoComplete(client, interaction);
    } catch (err) {
        console.error(
            `Error running autocomplete for command ${interaction.commandName}:`,
            err,
        );
        interaction.respond([]);
    }
}

async function handleButtonInteraction(client: Client, interaction: any) {
    for (const quest of await Quest.getQuests()) {
        try {
            if (await quest.onButtonInteract(client, interaction)) {
                break;
            }
        } catch (err) {
            console.error(
                `Error running button interaction for quest ${quest.fileName}:`,
                err,
            );
        }
    }
}

async function handleMessageCreate(message: any) {
    const user = SuperUser.create(message.author);

    if ((await user).db) {
        if ((await user).db.username !== message.author.username) {
            (await user).db.username = message.author.username;
            (await user).save();
        }
        //Message rewards xp
        const currentTime = new Date();
        const timeDifferenceMs =
            currentTime.getTime() - (await user).db.lastXpMessageAt.getTime();
        const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
        if (timeDifferenceMinutes >= 1) {
            (await user).giveXP(1);
            (await user).db.lastXpMessageAt = currentTime;
            (await user).save();
        }
    } else {
        (await user).db = await UserModel.create({
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

    await registerCommands(client);
    await Quest.loadQuests();

    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isCommand()) {
            await handleCommandInteraction(client, interaction);
        } else if (interaction.isAutocomplete()) {
            await handleAutocompleteInteraction(client, interaction);
        } else if (interaction.isButton()) {
            await handleButtonInteraction(client, interaction);
        }
    });

    client.on(Events.MessageCreate, async (message) => {
        await handleMessageCreate(message);
    });

    client.on(Events.GuildMemberUpdate, async (oldMemeber, newMember) => {
        timeoutTracking(oldMemeber, newMember);
    });
});

client.login(process.env.BOT_TOKEN);
