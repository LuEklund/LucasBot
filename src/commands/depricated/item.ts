import { Command } from "@/command";
import {
    InteractionContextType,
    SlashCommandBuilder,
    type Client,
    type CommandInteraction,
    type Interaction,
} from "discord.js";
import { ItemModel } from "../../models/item";
import { AutocompleteInteraction } from "discord.js";

export default class ItemCommand extends Command.Base {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("item")
            .setDescription("Item related stuff")
            .addSubcommand((sub) =>
                sub
                    .setName("add")
                    .setDescription("Add an item")
                    .addStringOption((opt) =>
                        opt.setName("name").setDescription("User to give gold to").setRequired(true),
                    )
                    .addStringOption((opt) =>
                        opt
                            .setName("tag")
                            .setDescription("The tag")
                            .addChoices(
                                { name: "Weapon", value: "weapon" },
                                { name: "Helmet", value: "helmet" },
                                { name: "Chestplate", value: "chestplate" },
                                { name: "Leggings", value: "leggings" },
                                { name: "Boots", value: "boots" },
                                { name: "Shield", value: "shield" },
                            )
                            .setRequired(true),
                    )
                    .addIntegerOption((opt) => opt.setName("cost").setDescription("The item cost").setRequired(true))
                    .addStringOption((opt) =>
                        opt.setName("attributes").setDescription("Attributes").setAutocomplete(true).setRequired(true),
                    ),
            )
            .addSubcommand((sub) =>
                sub
                    .setName("remove")
                    .setDescription("Remove an item")
                    .addStringOption((opt) =>
                        opt
                            .setName("name")
                            .setDescription("User to give gold to")
                            .setAutocomplete(true)
                            .setRequired(true),
                    ),
            )
            .setDefaultMemberPermissions(0n)
            .setContexts(InteractionContextType.Guild)
            .toJSON();
    }

    override async executeAutoComplete(client: Client, interaction: AutocompleteInteraction): Promise<void> {
        const sub = interaction.options.getSubcommand();

        const rawInput = interaction.options.getFocused().toString();

        switch (sub) {
            case "add": {
                const parts = rawInput.split(",").map((p) => p.trim());

                const rawLast = parts.pop() ?? "";

                // Checks if its a number
                if (/\d$/.test(rawLast)) {
                    const prefix = parts.length > 0 ? parts.join(", ") + ", " : "";
                    const suggestionBase = prefix + rawLast;

                    const suggestions = [
                        {
                            name: suggestionBase + ",",
                            value: suggestionBase + ",",
                        },
                        {
                            name: suggestionBase + "%,",
                            value: suggestionBase + "%,",
                        },
                    ];

                    await interaction.respond(suggestions);
                    return;
                }

                let possibleStats = ["strength", "agility", "charisma", "magicka", "stamina", "defense", "vitality"];

                for (const part of parts) {
                    const cleanedPart = (part.split("=")[0] || "").replace(/[^a-z]/gi, "").toLowerCase();
                    possibleStats = possibleStats.filter((stat) => stat.toLowerCase() !== cleanedPart);
                }

                const [keyPart, valuePart] = rawLast.split("=");

                const filteredStats = possibleStats.filter((stat) =>
                    stat.toLowerCase().startsWith((keyPart ?? "").toLowerCase()),
                );

                const suggestions = filteredStats.map((stat) => {
                    const newInput = parts.length > 0 ? parts.join(", ") + ", " + stat + "=" : stat + "=";

                    return {
                        name: newInput,
                        value: newInput,
                    };
                });

                if (rawInput.trim() === "") {
                    const allStats = possibleStats.map((stat) => ({
                        name: stat + "=",
                        value: stat + "=",
                    }));
                    await interaction.respond(allStats.slice(0, 25));
                    return;
                }

                await interaction.respond(suggestions.slice(0, 25));
                return;
            }
            case "remove": {
                // Search the DB using case-insensitive regex match
                const matchingThings = await ItemModel.find({
                    name: { $regex: new RegExp(rawInput, "i") },
                })
                    .sort({ name: 1 })
                    .limit(25);

                const suggestions = matchingThings.map((item) => ({
                    name: item.name,
                    value: item.name,
                }));

                await interaction.respond(suggestions.slice(0, 25));
                return;
            }
            default:
                return;
        }
    }

    override async executeCommand(client: Client, interaction: CommandInteraction<any>): Promise<void> {
        const sub = (interaction.options as any).getSubcommand();

        switch (sub) {
            case "add": {
                const nameOption = interaction.options.get("name")?.value as string;
                const tagOption = interaction.options.get("tag")?.value as string;
                const costOption = interaction.options.get("cost")?.value as number;
                const attributesOption = interaction.options.get("attributes")?.value as string;

                const attributes = ItemCommand.parseAttributes(new String(attributesOption));

                const newItem = await ItemModel.create({
                    name: nameOption,
                    tag: tagOption,
                    cost: costOption,
                    flatStatModifiers: attributes.flatStatModifiers,
                    percentageStatModifiers: attributes.percentageStatModifiers,
                });

                newItem.save();

                interaction.reply({
                    content: `${interaction.user} added item name: '${nameOption}', tag: '${tagOption}', cost: ${costOption} gold, attr: '${attributesOption}'`,
                    flags: "Ephemeral",
                });

                break;
            }
            case "remove": {
                const nameOption = interaction.options.get("name")?.value as string;

                await ItemModel.findOneAndDelete({ name: nameOption });
                interaction.reply({
                    content: `${interaction.user} removed item '${nameOption}'`,
                    flags: "Ephemeral",
                });

                break;
            }
            default:
                interaction.reply({
                    content: "You do not have permission to do this!",
                    flags: "Ephemeral",
                });
        }
    }

    static parseAttributes(attributes: String) {
        let flatStatModifiers = new Map<string, number>();
        let percentageStatModifiers = new Map<string, number>();

        const modifiers = attributes.split(",");

        for (const modifier of modifiers) {
            const parts = modifier.split("=");

            const key = parts[0]?.trim();
            const rawValue = parts[1]?.trim() ?? "0";
            const value = Number(rawValue.slice(0, rawValue.length - 1));

            if (!key) continue; // skip empty keys
            if (isNaN(value)) continue; // skip invalid numbers

            if (rawValue.endsWith("%")) {
                percentageStatModifiers.set(key, value);
            } else {
                flatStatModifiers.set(key, value);
            }
        }

        return {
            flatStatModifiers: flatStatModifiers,
            percentageStatModifiers: percentageStatModifiers,
        };
    }
}
