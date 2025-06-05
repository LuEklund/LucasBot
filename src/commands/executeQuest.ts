import { Command } from "@/command";
import { Quest } from "@/quest";
import {
    AutocompleteInteraction,
    InteractionContextType,
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class ExecuteQuestCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("executequest")
            .setDescription("Execute a Quest")
            .addStringOption((option) =>
                option
                    .setName("class")
                    .setDescription("class of quest")
                    .setAutocomplete(true)
                    .setRequired(true),
            )
            .setDefaultMemberPermissions(0n)
            .setContexts(InteractionContextType.Guild)
            .toJSON();
    }

    override async executeAutoComplete(
        client: Client,
        interaction: AutocompleteInteraction,
    ): Promise<void> {
        const focusedOption = interaction.options.getFocused(true).name;
        if (focusedOption == "class") {
            interaction.respond(
                Quest.getQuests().map((q) => ({
                    name: q.fileName,
                    value: q.fileName,
                })),
            );
            return;
        }
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const className = interaction.options.get("class", true)
            .value as string;

        const quest = Quest.getQuest(className);
        if (!quest) {
            await interaction.reply(`Quest class "${className}" not found.`);
            return;
        }

        await interaction.reply(`Executing quest: "${className}"`);
        await quest.startQuest(client);
    }
}
