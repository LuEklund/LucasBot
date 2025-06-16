import { Command } from "@/commands";
import { CommandInteraction, InteractionResponse, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { AppUser } from "../user";
import { UserModel } from "@/models/user";

export default class XpCommand extends Command.Base {
    public override main: Command.Command = new Command.Command("xp", "XP related stuff", []);
    public override subs: Command.Command[] = [
        // prettier-ignore
        new Command.Command(
            "top", 
            "Shows you the top 10 people based on xp", 
            [], 
            this.onTop
        ),
        // prettier-ignore
        new Command.Command(
            "set",
            "Sets xp to a user",
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
            "Adds xp to a user",
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

    public async onTop(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const topUsers = await UserModel.find().sort({ xp: -1 }).limit(10).exec();

        if (topUsers.length === 0) return await interaction.reply("No users found in the leaderboard.");

        const lines = await Promise.all(
            topUsers.map(async (user, index) => {
                const name = (await AppUser.fromID(user.id)).discord.displayName;
                return `**${index + 1}.** ${name} — ${user.xp} XP`;
            }),
        );
        const description = lines.join("\n");

        const embed = new EmbedBuilder().setTitle("🏆 XP Leaderboard").setDescription(description).setColor("#FFD700");

        return await interaction.reply({ embeds: [embed] });
    }

    public async onSet(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = interaction.options.get("user")?.user;
        const amountOpt = interaction.options.get("amount")?.value as number;
        if (!userOpt) return interaction.reply(`Failed to get user option`);

        const user = await AppUser.fromID(userOpt.id);

        await user.addXP(amountOpt).save();

        return interaction.reply(`Set ${amountOpt} xp to ${user.discord}`);
    }

    public async onAdd(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = interaction.options.get("user")?.user;
        const amountOpt = interaction.options.get("amount")?.value as number;
        if (!userOpt) return interaction.reply(`Failed to get user option`);

        const user = await AppUser.fromID(userOpt.id);

        await user.addXP(amountOpt).save();

        return interaction.reply(`Added ${amountOpt} xp to ${user.discord}`);
    }
}
