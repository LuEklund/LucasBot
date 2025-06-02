import { Command } from "@/command";
import { SlashCommandBuilder, User, type Client, type CommandInteraction } from "discord.js";
import mongoose from "mongoose";
import { SuperUser, UserModel } from '../models/user';

export default class XpCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("xp")
            .setDescription("XP related stuff")
            .addUserOption((option) => 
                option.setName("user")
                .setDescription("User")
                .setRequired(false)
            )
            .addStringOption((option) =>
                option.setName("command")
                .setDescription("The command you want to perform to the user")
                .setRequired(false)
            )
            .toJSON();
    }

    override async executeCommand(client: Client, interaction: CommandInteraction<any>): Promise<void> {
        const userOption = interaction.options.get("user", false);
        const user = SuperUser.create(userOption?.user ?? interaction.user);

        let message: string;

        let xp: number | undefined;

        const usersModel = await UserModel.find();
        for (const userModel of usersModel) {
            if (userModel.id == (await user).discord.id) {
                xp = userModel.xp;
                break;
            }
        }
        message = `${(await user).discord} has ${xp || "no"} xp`;

        // Command stuff
        const commandOption = interaction.options.get("command", false);
        if (commandOption != null) { // Needs to be checked for admin
            const command: string[] = commandOption.value?.toString().split(" ") || [];
            switch (command[0]) {
                case "grant":
                    const xp = Number(command[1]);
                    (await user).giveXP(xp);
                    message = `${interaction.user} granted ${(await user).discord} ${xp} xp`;
                    break;

                default:
                    message = `Command not found: "${commandOption.value as string}" ¯\\_(ツ)_/¯`;
                    break;
            }
        }

        interaction.reply(message);
    }
}
