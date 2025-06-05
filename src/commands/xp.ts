import { Command } from "@/core/command";
import {
    InteractionContextType,
    SlashCommandBuilder,
    User,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";
import { giveXP, setXP, UserModel } from "../models/user";

export default class XpCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("xp")
            .setDescription("XP related stuff")
            .addSubcommand((sub) =>
                sub
                    .setName("view")
                    .setDescription("View the XP of a user")
                    .addUserOption((opt) =>
                        opt
                            .setName("target")
                            .setDescription("Users XP that gets viewed")
                            .setRequired(true),
                    ),
            )
            .addSubcommand((sub) =>
                sub
                    .setName("add")
                    .setDescription("Add XP to a user")
                    .addUserOption((opt) =>
                        opt
                            .setName("target")
                            .setDescription("User to give XP to")
                            .setRequired(true),
                    )
                    .addIntegerOption((opt) =>
                        opt
                            .setName("amount")
                            .setDescription("Amount of XP")
                            .setRequired(true),
                    ),
            )
            .addSubcommand((sub) =>
                sub
                    .setName("set")
                    .setDescription("Set a users XP to a value")
                    .addUserOption((opt) =>
                        opt
                            .setName("target")
                            .setDescription("User to set XP to")
                            .setRequired(true),
                    )
                    .addIntegerOption((opt) =>
                        opt
                            .setName("amount")
                            .setDescription("Amount of XP")
                            .setRequired(true),
                    ),
            )
            .setDefaultMemberPermissions(0n)
            .setContexts(InteractionContextType.Guild)
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const sub = interaction.options.getSubcommand();
        const target =
            interaction.options.get("target")?.user || interaction.user;

        switch (sub) {
            case "view": {
                const usersModel = await UserModel.find();
                for (const userModel of usersModel) {
                    if (userModel.id == target.id) {
                        interaction.reply(
                            `${target} has ${userModel.xp || "no"} xp`,
                        );
                    }
                }
                break;
            }
            case "add": {
                if (!interaction.memberPermissions?.has("Administrator")) break;

                const amount = interaction.options.get("amount")
                    ?.value as number;
                try {
                    giveXP(target.id, amount);
                    interaction.reply({
                        content: `${interaction.user} added ${amount}xp to ${target}`,
                        ephemeral: true,
                    });
                } catch (err) {
                    console.error(err);
                    interaction.reply({
                        content: `${interaction.user} failed to give ${target} ${amount}xp`,
                        ephemeral: true,
                    });
                }

                break;
            }
            case "set": {
                if (!interaction.memberPermissions?.has("Administrator")) break;

                const amount = interaction.options.get("amount")
                    ?.value as number;
                try {
                    setXP(target.id, amount);
                    interaction.reply({
                        content: `${interaction.user} set ${target}'s xp to ${amount}`,
                        ephemeral: true,
                    });
                } catch (err) {
                    console.error(err);
                    interaction.reply({
                        content: `${interaction.user} failed to set ${target}'s xp to ${amount}`,
                        ephemeral: true,
                    });
                }

                break;
            }
            default:
                interaction.reply("You do not have permission to do this!");
        }
    }
}
