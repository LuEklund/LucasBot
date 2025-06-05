import { Command } from "@/command";
import { giveGold } from "@/models/user";
import {
    SlashCommandBuilder,
    User,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class PingCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("diceplayer")
            .setDescription(
                "Roll a random number from 1-100 against another user",
            )
            .addUserOption((option) =>
                option
                    .setName("target")
                    .setDescription("Whom to challenge")
                    .setRequired(true),
            )
            .addNumberOption((option) =>
                option
                    .setName("amount")
                    .setDescription("Gold to wager")
                    .setMinValue(0.01)
                    .setMaxValue(100.0)
                    .setRequired(true),
            )
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const target =
            interaction.options.get("target")?.user || interaction.user;
        const amount = interaction.options.get("amount")?.value as number;
        if (amount > 100) {
            await interaction.reply({
                content: `${amount} can't be over 100g`,
                ephemeral: true,
            });
            return;
        }

        const random: boolean = Math.random() < 0.5;

        try {
            const winner: User = random ? interaction.user : target;
            giveGold(winner, amount);
            await interaction.reply(`${winner} wins ${amount}!`);
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: `${interaction.user} failed to challange ${target}'s xp to ${amount}`,
                ephemeral: true,
            });
        }
    }
}
