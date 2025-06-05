import { Command } from "@/command";
import {
    SlashCommandBuilder,
    GuildMember,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class PongCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("pong")
            .setDescription("test")
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to pong"),
            )
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const member = interaction.options.getMember(
            "user",
        ) as GuildMember | null;

        const name = member?.nickname ?? member?.user.username ?? "nope";
        await interaction.reply("Pong Works! " + name);
    }
}
