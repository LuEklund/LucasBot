import { Command } from "@/command";
import {
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class DeezNutsCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("deeznuts")
            .setDescription("ha goteem")
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        await interaction.reply("ha goteem ha.... goteem");
    }
}
