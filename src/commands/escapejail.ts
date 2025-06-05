import { Command } from "@/command";
import { giveGold, UserModel } from "@/models/user";
import {
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class EscapeJailCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("escapejail")
            .setDescription("Try to escape from jail")
            .addStringOption((opt) =>
                opt
                    .setName("choice")
                    .setDescription("Choose what to do")
                    .setRequired(true)
                    .addChoices(
                        {
                            name: "Use Charisma To Escape (High risk to fail)",
                            value: "use_charisma",
                        },
                        { name: "Pay bail", value: "pay_bail" },
                    ),
            )
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const action = interaction.options.getString("choice");

        switch (action) {
            case "use_charisma":
                // handle the user using charisma
                let randomNumber = Math.floor(Math.random() * 6);
                if (randomNumber <= 3) {
                    await interaction.reply(
                        "You failed to escape... you were fined extra 10 gold.",
                    );
                    await giveGold(interaction.user.id, -10);
                } else {
                    await interaction.reply(
                        "The security guard gives in and releases you... congrats.",
                    );
                }

                break;
            case "pay_bail":
                // handle pay bail
                await interaction.reply(
                    "You pay the bail of 100 gold and you were freed...",
                );
                await giveGold(interaction.user.id, -100);
                break;
            default:
                // handle unknown option
                await interaction.reply({
                    content: "Invalid option",
                    ephemeral: true,
                });
                break;
        }
    }
}
