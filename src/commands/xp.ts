import { Command } from "@/commands";
import { CommandInteraction, InteractionResponse, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { AppUser, calculateLevel } from "../user";
import { UserDB } from "@/models/user";
import { Globals } from "..";

export default class XpCommand extends Command.Base {
    public override main: Command.Command = new Command.Command("xp", "XP related stuff", []);
    public override subs: Command.Command[] = [
        new Command.Command("top", "Shows you the top 10 people based on xp", [], this.onTop),
        new Command.Command(
            "set",
            "Sets xp to a user",
            [
                {
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
                },
            ],
            this.onSet,
            undefined,
            true,
        ),
        new Command.Command(
            "add",
            "Adds xp to a user",
            [
                {
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
                },
            ],
            this.onAdd,
            undefined,
            true,
        ),
    ];

    public async onTop(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const topUsers = await UserDB.Model.find().sort({ xp: -1 }).limit(10).exec();

        if (topUsers.length === 0) return await interaction.reply("No users found in the leaderboard. Looks like everyone’s still napping 💤.");

        const lines = await Promise.all(
            topUsers.map(async (user, index) => {
                const appUser = await AppUser.fromID(user.id);
                const name = appUser.discord.displayName || "Unknown Hero";
                const xpFormatted = user.xp.toFixed(2);
                return `**#${index + 1}** - ${name} — *${xpFormatted}* ${Globals.ATTRIBUTES.xp.emoji}`;
            }),
        );

        const embed = new EmbedBuilder()
            .setTitle("🏆 XP Leaderboard")
            .setDescription(lines.join("\n"))
            .setColor("#FFD700")
            .setFooter({ text: "Keep grinding or keep hiding... your choice." })
            .setTimestamp();

        return await interaction.reply({ embeds: [embed] });
    }

    public async onSet(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = interaction.options.get("user")?.user;
        const amountOpt = interaction.options.get("amount")?.value as number;
        if (!userOpt) return interaction.reply({ content: `Failed to get user option`, flags: "Ephemeral" });

        const user = await AppUser.fromID(userOpt.id);

        // math is cool, and confusing,... i think ----- SFIF WAS HERE!!!!!!!!
        await user.setXP(amountOpt).save();

        const newLevel = calculateLevel(amountOpt);
        if (newLevel < user.database.level) user.database.level = newLevel;

        return interaction.reply({
            content: `XP has been **set** to ${amountOpt.toFixed(2)} for ${user.discord.displayName}. Level adjustment? Hopefully you leveled up IRL too! 🎉`,
            flags: "Ephemeral",
        });
    }

    public async onAdd(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = interaction.options.get("user")?.user;
        const amountOpt = interaction.options.get("amount")?.value as number;
        if (!userOpt) return interaction.reply({ content: `Failed to get user option`, flags: "Ephemeral" });

        const user = await AppUser.fromID(userOpt.id);

        await user.addXP(amountOpt).save();

        const newLevel = calculateLevel(user.database.xp);
        if (newLevel < user.database.level) user.database.level = newLevel;

        return interaction.reply({
            content: `Added **${amountOpt.toFixed(2)}** XP to ${user.discord.displayName}. Keep up the grind, champ! 💪`,
            flags: "Ephemeral",
        });
    }
}
