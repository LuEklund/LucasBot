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

    private async generateEmbed(user: AppUser): Promise<EmbedBuilder> {
        let stuffField: APIEmbedField = { name: "", value: "", inline: false };
        ["level", "xp", "gold", "skillpoint"].forEach((key) => {
            const attribute = Globals.ATTRIBUTES[key as keyof typeof Globals.ATTRIBUTES];
            if (!attribute) {
                stuffField.value += `🚫: ${key}\n`;
                return;
            }

            const value =
                key === "gold"
                    ? user.inventory.gold
                    : key === "skillpoint"
                      ? user.database.skillPoints
                      : (user.database[attribute.value as keyof typeof user.database] as number);

            const valueStr = typeof value === "number" && !Number.isNaN(value) ? value.toFixed(2) : "N/A";

            stuffField.value += `${attribute.emoji} ${attribute.name} ${valueStr}\n`;
        });

        let statField: APIEmbedField = { name: "Stats", value: "", inline: false };
        UserDB.StatDB.keyArray.forEach((key) => {
            const attribute = Globals.ATTRIBUTES[key as keyof typeof Globals.ATTRIBUTES];
            if (!attribute) {
                stuffField.value += `🚫 ${key}: none\n`;
                return;
            }
            const value = user.database.stats[attribute.value as UserDB.StatDB.Type];
            const valueFromItems = user.getStat(attribute.value as UserDB.StatDB.Type) - value;
            statField.value += `${attribute.emoji} ${attribute.name}: ${value.toFixed(2)} ${valueFromItems > 0 ? "+" : ""} ${valueFromItems.toFixed(2)}\n`;
        });

        let inventoryField: APIEmbedField = { name: "Inventory", value: "", inline: false };
        let equippedField: APIEmbedField = {
            name: "Equipped ✅                                               \u200B",
            value: "",
            inline: true,
        };
        let unequippedField: APIEmbedField = {
            name: "Unequipped ❌",
            value: "",
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

        groupedItems
            .sort((a, b) => {
                const aItem = Item.manager.findByName(a[1]);
                const bItem = Item.manager.findByName(b[1]);

                const indexA = Item.keyArray.indexOf(aItem ? aItem.type : "");
                const indexB = Item.keyArray.indexOf(bItem ? bItem.type : "");

                const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
                const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

                if (safeIndexA !== safeIndexB) return safeIndexA - safeIndexB;
                else return a[1].localeCompare(b[1]);
            })
            .forEach(([equipped, name, times]) => {
                const item = Item.manager.findByName(name);
                if (!item) return;

                let modifierString: string = "";
                const flat = Object.entries(item.flatModifiers);
                const percent = Object.entries(item.percentageModifiers);
                const all = [...flat, ...percent];
                for (const [index, [key, value]] of all.entries()) {
                    const attribute = Globals.ATTRIBUTES[key as keyof typeof Globals.ATTRIBUTES];
                    if (!attribute) {
                        modifierString += `🚫  ${key}: none\n`;
                        continue;
                    }

                    const isPercent = index >= flat.length;
                    modifierString += `*${attribute.emoji} ${value > 0 ? "+" : ""}${isPercent ? (value * 100).toFixed(0) : value.toFixed(2)}${isPercent ? "%" : ""}*\n`;
                }

                (equipped ? equippedField : unequippedField).value += `**x${times} ${item.name}**\n*Type: ${item.type}*\n${modifierString || ""}\n`;
            });

        const len: number = (equippedField.value = equippedField.value.slice(0, 900)).length;
        unequippedField.value = unequippedField.value.slice(0, 901 - len);

        return new EmbedBuilder()
            .setTitle(`${user.discord.displayName}'s Profile`)
            .setColor(user.discord.hexAccentColor || 0x3498db)
            .setThumbnail(user.discord.avatarURL())
            .setFooter({ text: "Profile displayed" })
            .setTimestamp()
            .setFields([stuffField, statField, inventoryField, equippedField, unequippedField].slice(0, 25));
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
