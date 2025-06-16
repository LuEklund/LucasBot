import { Command } from "@/commands";
import { ItemDB } from "@/models/item";
import {
    CommandInteraction,
    InteractionResponse,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
} from "discord.js";
import { Globals } from "..";

export default class ItemCommand extends Command.Base {
    public override main: Command.Command = new Command.Command("item", "Item related stuff", []);
    public override subs: Command.Command[] = [
        // prettier-ignore
        new Command.Command(
            "add",
            "Add an item",
            [{
                name: "name",
                description: "The name of the new item",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "type",
                description: "The item type",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            },
            {
                name: "cost",
                description: "How much the item costs",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "modifiers",
                description: "The items modifiers",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            }],
            this.onAdd,
            this.onAddAutocomplete,
        ),
        // prettier-ignore
        new Command.Command(
            "remove",
            "Remove an item",
            [{
                name: "name",
                description: "The name of the item you want to remove",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            }],
            this.onRemove,
            this.onRemoveAutocomplete,
        ),
    ];

    public async onAdd(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const nameOpt = interaction.options.get("name")?.value as string;
        const typeOpt = interaction.options.get("type")?.value as string;
        const costOpt = interaction.options.get("cost")?.value as number;
        const attributesOpt = interaction.options.get("attributes")?.value as string;

        const modifiers = ItemCommand.parseModifiers(new String(attributesOpt));

        const newItem = await ItemDB.Model.create({
            name: nameOpt,
            type: typeOpt,
            cost: costOpt,
            flatStatModifiers: modifiers.flatStatModifiers,
            percentageStatModifiers: modifiers.percentageStatModifiers,
        });

        newItem.save();

        return interaction.reply({
            content: `Added item name: '${nameOpt}', tag: '${typeOpt}', cost: ${costOpt}  ${Globals.ATTRIBUTES.gold.emoji}, attr: '${attributesOpt}'`,
            flags: "Ephemeral",
        });
    }

    public async onRemove(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const nameOpt = interaction.options.get("name")?.value as string;

        await ItemDB.Model.findOneAndDelete({ name: nameOpt });
        return interaction.reply({
            content: `Removed item '${nameOpt}'`,
            flags: "Ephemeral",
        });
    }

    public async onAddAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused(true);

        if (focused.name === "type") {
            let types: { name: string; value: string }[] = [];

            ItemDB.Types.forEach((type) => {
                types.push({ name: type, value: type });
            });

            return interaction.respond(types);
        }

        const parts = focused.value
            .toString()
            .split(",")
            .map((p) => p.trim());

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

        if (focused.value.toString().trim() === "") {
            const allStats = possibleStats.map((stat) => ({
                name: stat + "=",
                value: stat + "=",
            }));
            return await interaction.respond(allStats.slice(0, 25));
        }

        return await interaction.respond(suggestions.slice(0, 25));
    }

    public async onRemoveAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused().toString();

        const matchingThings = await ItemDB.Model.find({
            name: { $regex: new RegExp(focused.toString(), "i") },
        })
            .sort({ name: 1 })
            .limit(25);

        const suggestions = matchingThings.map((item) => ({
            name: item.name,
            value: item.name,
        }));

        await interaction.respond(suggestions.slice(0, 25));
    }

    static parseModifiers(modifiers: String): any {
        let flatModifiers = new Map<string, number>();
        let percentageModifiers = new Map<string, number>();

        for (const modifier of modifiers.split(",")) {
            const parts = modifier.split("=");

            const key = parts[0]?.trim();
            const rawValue = parts[1]?.trim() ?? "0";
            const value = Number(rawValue.slice(0, rawValue.length - 1));

            if (!key) continue; // skip empty keys
            if (isNaN(value)) continue; // skip invalid numbers

            if (rawValue.endsWith("%")) {
                percentageModifiers.set(key, value);
            } else {
                flatModifiers.set(key, value);
            }
        }

        return {
            flatStatModifiers: flatModifiers,
            percentageStatModifiers: percentageModifiers,
        };
    }
}
