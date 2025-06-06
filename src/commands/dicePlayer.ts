import { Command } from "@/command";
import { giveGold } from "@/models/user";
import {
    SlashCommandBuilder,
    User,
    type Client,
    type CommandInteraction,
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
        interaction: CommandInteraction,
    ): Promise<void> {
        const target =
            interaction.options.get("target")?.user || interaction.user;
        const amount = interaction.options.get("amount")?.value as number;
        if (amount > 100) {
            interaction.reply({
                content: `${amount} can't be over 100g`,
                flags: "Ephemeral",
            });
        }

        const random: boolean = Math.random() % 1 < 0.5;

        try {
            const winner: User = random ? interaction.user : target;
            giveGold(winner, amount);
            interaction.reply(`${winner} wins ${amount}!`);
        } catch (err) {
            console.error(err);
            interaction.reply({
                content: `${interaction.user} failed to challange ${target}'s xp to ${amount}`,
                flags: "Ephemeral",
            });
        }
    }
}
