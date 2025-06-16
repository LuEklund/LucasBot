import { Command } from "@/commands";
import { CommandInteraction, InteractionResponse, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { AppUser } from "../user";
import { UserModel } from "@/models/user";

export default class XpCommand extends Command.Base {
    public override main: Command.Command = new Command.Command("gold", "Gold related stuff", []);
    public override subs: Command.Command[] = [
        // prettier-ignore
        new Command.Command(
            "set",
            "Set a users gold to a value",
            [{
                name: "user",
                description: "The user that you want to affect",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "amount",
                description: "The amount you want to set",
                type: ApplicationCommandOptionType.Number,
                required: true,
            }],
            this.onAdd,
        ),
        // prettier-ignore
        new Command.Command(
            "add",
            "Add gold to a user",
            [{
                name: "user",
                description: "The user that you want to affect",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "amount",
                description: "The amount you want to give",
                type: ApplicationCommandOptionType.Number,
                required: true,
            }],
            this.onAdd,
        ),
    ];

    public async onSet(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = interaction.options.get("user")?.user;
        const amountOpt = interaction.options.get("amount")?.value as number;
        if (!userOpt) return interaction.reply(`Failed to get user option`);

        const user = await AppUser.fromID(userOpt.id);

        await user.setGold(amountOpt).save();

        return interaction.reply(`Set ${amountOpt} gold to ${user.discord}`);
    }

    public async onAdd(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = interaction.options.get("user")?.user;
        const amountOpt = interaction.options.get("amount")?.value as number;
        if (!userOpt) return interaction.reply(`Failed to get user option`);

        const user = await AppUser.fromID(userOpt.id);

        await user.addGold(amountOpt).save();

        return interaction.reply(`Added ${amountOpt} gold to ${user.discord}`);
    }
}
