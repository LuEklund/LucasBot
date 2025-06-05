import { Command } from "@/command";
import {
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class PingCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("ping")
            .setDescription("test")
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        await interaction.reply("Ping Works!");
    }
}
