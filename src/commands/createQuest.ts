import { Command } from "@/command";
import { QuestModel } from "@/models/quest";
import { Quest } from "@/quest";
import {
    AutocompleteInteraction,
    InteractionContextType,
    messageLink,
    SlashCommandBuilder,
    User,
    type Client,
    type CommandInteraction,
} from "discord.js";

export default class CreateQuestCommand extends Command.Base {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("createquest")
            .setDescription("create a quest")
            .addStringOption((option) =>
                option
                    .setName("title")
                    .setDescription("title of the quest")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("image")
                    .setDescription("image link")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("description")
                    .setDescription("description of the quest")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("class")
                    .setDescription("class of the quest")
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

        console.log("executeAutoComplete:focusedOption", focusedOption);

        if (focusedOption == "class") {
            interaction.respond(
                await Quest.getQuests().map((q) => ({
                    name: q.fileName,
                    value: q.fileName,
                })),
            );
            return;
        }
    }

    override async executeCommand(
        client: Client,
        interaction: CommandInteraction<any>,
    ): Promise<void> {
        console.log("getting classes");

        const title = interaction.options.get("title", true).value as string;
        const imageUrl = interaction.options.get("image", true).value as string;
        const description = interaction.options.get("description", true)
            .value as string;
        const questClass = interaction.options.get("class", true)
            .value as string;
        const creatorId = interaction.member!.id as string;

        let questClassFilesNames = Quest.getQuests().map((q) => q.fileName);
        if (!questClassFilesNames.includes(questClass)) {
            await interaction.reply(
                `Quest class '${questClass}' does not exist.`,
            );
            return;
        }

        const existingQuest = await QuestModel.findOne({
            className: questClass,
        });
        if (existingQuest) {
            await existingQuest.deleteOne();
        }

        const quest = await QuestModel.create({
            title: title,
            imageUrl: imageUrl,
            description: description,
            className: questClass,
            creatorId: creatorId,
        });

        interaction.reply(
            `Created quest ${title} ${imageUrl} ${description} ${questClass} - ${quest._id}`,
        );
    }
}
