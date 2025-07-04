import { Command } from "@/commands";
import {
    CommandInteraction,
    InteractionResponse,
    ApplicationCommandOptionType,
    EmbedBuilder,
    ButtonInteraction,
    type InteractionUpdateOptions,
    type APIEmbedField,
} from "discord.js";
import { AppUser } from "../user";
import { Globals } from "..";
import { UserDB } from "@/models/user";
import { AppButton } from "@/ui";
import { Item } from "@/models/item";

export default class ProfileCommand extends Command.Base {
    public override main: Command.Command = new Command.Command(
        "profile",
        "Display your profile",
        [{ name: "user", description: "Who do you want to stalk today?", type: ApplicationCommandOptionType.User }],
        this.onExecute.bind(this),
    );

    buttons: AppButton[] = [];

    public async onExecute(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const userOpt = (interaction.options.get("user") || interaction).user;
        if (!userOpt) return interaction.reply(`Failed to get user option`);
        const user = await AppUser.fromID(userOpt.id);

        if (this.buttons.length <= 0) this.buttons = await this.generateButtons();

        const actionRow = user.database.skillPoints >= 1 ? AppButton.createActionRow(this.buttons) : undefined;

        const embed = await this.generateEmbed(user);
        return await interaction.reply({
            embeds: [embed],
            components: user.discord.id === interaction.user.id ? actionRow : undefined,
            flags: "Ephemeral",
        });
    }

    private progressBar(value: number, max: number, size = 15) {
        const progress = Math.round((value / max) * size);
        const emptyProgress = size - progress;
        const bar = "█".repeat(progress) + "░".repeat(emptyProgress);
        return `\`${bar}\``;
    }

    private async generateEmbed(user: AppUser): Promise<EmbedBuilder> {
        const level = user.database.level || 1;
        const xp = user.database.xp || 0;
        const xpToNext = (level + 1) * 100;
        const gold = user.inventory.gold;
        const skillPoints = user.database.skillPoints;

        const stuffField: APIEmbedField = {
            name: "🎯 Basic Info",
            value: [
                `${Globals.ATTRIBUTES.level.emoji} Level: **${level}**`,
                `${Globals.ATTRIBUTES.xp.emoji} XP: **${xp.toFixed(2)}** / ${xpToNext} ${this.progressBar(xp, xpToNext)}`,
                `${Globals.ATTRIBUTES.gold.emoji} Gold: **${gold.toFixed(2)}**`,
                `${Globals.ATTRIBUTES.skillpoint.emoji} Skill Points: **${skillPoints}** ${this.progressBar(skillPoints, 10, 10)}`,
            ].join("\n"),
            inline: false,
        };

        const statLines = UserDB.StatDB.keyArray.map((key) => {
            const attribute = Globals.ATTRIBUTES[key as keyof typeof Globals.ATTRIBUTES];
            if (!attribute) return `🚫 ${key}: none`;

            const base = user.database.stats[attribute.value as UserDB.StatDB.Type];
            const total = user.getStat(attribute.value as UserDB.StatDB.Type);
            const bonus = total - base;
            const bonusStr = bonus > 0 ? ` (+${bonus.toFixed(2)})` : "";
            return `${attribute.emoji} ${attribute.name}: **${total.toFixed(2)}**${bonusStr}`;
        });

        const statField: APIEmbedField = {
            name: "📊 Stats",
            value: statLines.join("\n"),
            inline: true,
        };

        let groupedMap = new Map<string, [boolean, string, number]>();
        user.inventory.items.forEach(([equipped, name]) => {
            const normalizedName = name.trim().toLowerCase();
            const key = `${equipped}-${normalizedName}`;
            if (groupedMap.has(key)) {
                const entry = groupedMap.get(key)!;
                entry[2] += 1;
            } else {
                groupedMap.set(key, [equipped, name, 1]);
            }
        });
        let groupedItems: [boolean, string, number][] = Array.from(groupedMap.values());
        groupedItems.sort((a, b) => {
            const aItem = Item.manager.findByName(a[1]);
            const bItem = Item.manager.findByName(b[1]);

            const indexA = Item.keyArray.indexOf(aItem ? aItem.type : "");
            const indexB = Item.keyArray.indexOf(bItem ? bItem.type : "");

            const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
            const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

            if (safeIndexA !== safeIndexB) return safeIndexA - safeIndexB;
            else return a[1].localeCompare(b[1]);
        });

        const buildItemLines = (items: [boolean, string, number][]) =>
            items
                .map(([equipped, name, count]) => {
                    const item = Item.manager.findByName(name);
                    if (!item) return null;

                    const flatMods = Object.entries(item.flatModifiers);
                    const percentMods = Object.entries(item.percentageModifiers);
                    let modifierString = "";

                    for (const [key, value] of [...flatMods, ...percentMods]) {
                        const attr = Globals.ATTRIBUTES[key as keyof typeof Globals.ATTRIBUTES];
                        if (!attr) {
                            modifierString += `🚫  ${key}: none\n`;
                            continue;
                        }
                        const isPercent = percentMods.find((e) => e[0] === key) !== undefined;
                        modifierString += `*${attr.emoji} ${value > 0 ? "+" : ""}${isPercent ? (value * 100).toFixed(0) : value.toFixed(2)}${isPercent ? "%" : ""}*\n`;
                    }
                    return `**x${count} ${item.name}**\n*Type: ${item.type}*\n${modifierString}`;
                })
                .filter(Boolean)
                .join("\n\n");

        const equippedItems = groupedItems.filter((i) => i[0]);
        const unequippedItems = groupedItems.filter((i) => !i[0]);

        const equippedField: APIEmbedField = {
            name: "🛡️ Equipped",
            value: equippedItems.length > 0 ? buildItemLines(equippedItems) : "_None_",
            inline: true,
        };
        const unequippedField: APIEmbedField = {
            name: "🎒 Unequipped",
            value: unequippedItems.length > 0 ? buildItemLines(unequippedItems) : "_None_",
            inline: true,
        };

        return new EmbedBuilder()
            .setTitle(`${user.discord.displayName}'s Profile`)
            .setColor(user.discord.hexAccentColor || 0x3498db)
            .setThumbnail(user.discord.avatarURL() || undefined)
            .setFooter({ text: "Profile" })
            .setTimestamp()
            .addFields(stuffField, statField, equippedField, unequippedField);
    }

    private async generateButtons(): Promise<AppButton[]> {
        let buttons: AppButton[] = [];

        UserDB.StatDB.keyArray.forEach((key) => {
            buttons.push(
                new AppButton(
                    `${Globals.ATTRIBUTES[key as keyof typeof Globals.ATTRIBUTES].emoji} ${Globals.ATTRIBUTES[key as keyof typeof Globals.ATTRIBUTES].name}`,
                    async (interaction: ButtonInteraction) => {
                        const user = await AppUser.fromID(interaction.user.id);
                        if (user.database.skillPoints >= 1) {
                            user.database.stats[key as UserDB.StatDB.Type] += 1;
                            await user.addSkillPoints(-1).save();

                            const embed = await this.generateEmbed(user);

                            let options: InteractionUpdateOptions = {};
                            options.embeds = [embed];
                            if (user.database.skillPoints < 1) options.components = [];
                            interaction.update(options);
                        } else {
                            interaction.reply({
                                content: "You don't have enough skillpoints",
                                flags: "Ephemeral",
                            });
                        }
                    },
                ),
            );
        });

        return buttons;
    }
}
