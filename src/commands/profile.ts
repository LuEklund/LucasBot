import { Command } from "@/commands";
import { CommandInteraction, InteractionResponse, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { AppUser } from "../user";
import { Globals } from "..";

export default class ProfileCommand extends Command.Base {
    // prettier-ignore
    public override main: Command.Command = new Command.Command(
        "profile", "Display your stats", 
        [{ name: "user", description: "Who do you want to stalk?", type: ApplicationCommandOptionType.User }],
        this.onExecute.bind(this),
    );

    public async onExecute(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = (interaction.options.get("user") || interaction).user;
        if (!userOpt) return interaction.reply(`Failed to get user option`);
        const user = await AppUser.fromID(userOpt.id);

        const embed = await this.generateEmbed(user);
        return await interaction.reply({
            embeds: [embed],
            flags: "Ephemeral",
        });
    }

    private async generateEmbed(user: AppUser): Promise<EmbedBuilder> {
        // prettier-ignore
        const statsData = [
            { name: Globals.ATTRIBUTES.strength.name, value: user.database.stats.strength, emoji: Globals.ATTRIBUTES.strength.emoji },
            { name: Globals.ATTRIBUTES.defense.name, value: user.database.stats.defense, emoji: Globals.ATTRIBUTES.defense.emoji },
            { name: Globals.ATTRIBUTES.agility.name, value: user.database.stats.agility, emoji: Globals.ATTRIBUTES.agility.emoji },
            { name: Globals.ATTRIBUTES.magicka.name, value: user.database.stats.magicka, emoji: Globals.ATTRIBUTES.magicka.emoji },
            { name: Globals.ATTRIBUTES.vitality.name, value: user.database.stats.vitality, emoji: Globals.ATTRIBUTES.vitality.emoji },
            { name: Globals.ATTRIBUTES.stamina.name, value: user.database.stats.stamina, emoji: Globals.ATTRIBUTES.stamina.emoji },
            { name: Globals.ATTRIBUTES.charisma.name, value: user.database.stats.charisma, emoji: Globals.ATTRIBUTES.charisma.emoji },
        ];

        const maxNameLength = Math.max(...statsData.map((s) => s.name.length));

        const statLines = statsData.map((stat) => {
            const paddedName = stat.name.padEnd(maxNameLength, " ");
            return `${stat.emoji} ${paddedName}: ${stat.value}`;
        });

        const statString = "```" + statLines.join("\n") + "```";

        let inventoryString = "";

        for (const [booleanValue, stringValue] of [...user.inventory.items].sort(
            (a, b) => (b[0] === true ? 1 : 0) - (a[0] === true ? 1 : 0),
        )) {
            const status = booleanValue ? "✅ (Ready)" : "❌"; // Compact status display
            inventoryString += `${status} ${stringValue}\n`;
        }

        return new EmbedBuilder()
            .setTitle(`${user.discord.displayName}'s Current Stats`)
            .setDescription(
                `**Stats**\n${statString}\n\n**Inventory**\n${inventoryString !== "" ? inventoryString : "No items..."}`,
            )
            .setColor(user.discord.hexAccentColor || 0x3498db)
            .setThumbnail(user.discord.avatarURL())
            .setFooter({ text: "Stats displayed" })
            .setTimestamp();
    }
}
