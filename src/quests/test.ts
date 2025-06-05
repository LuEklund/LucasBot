import { Quest } from "@/core/quest";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    type Client,
    type TextChannel,
} from "discord.js";

export default class TestQuest extends Quest {
    public override async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (interaction.customId === `${this.fileName}#help`) {
            await interaction.reply(
                "This is a help message for the Test Quest.",
            );
            return true;
        }

        return false;
    }

    public override async startQuest(client: Client): Promise<void> {
        const questData = await this.getQuestData();

        let questChannel: TextChannel = (await client.channels.fetch(
            process.env.QUEST_CHANNEL_ID || "undefined",
        )) as TextChannel;

        const builder = new EmbedBuilder()
            .setTitle(questData.title)
            .setDescription(questData.description.replace(/\\n/g, "\n"))
            .setColor("#0099ff")
            .setThumbnail(questData.imageUrl)
            .addFields({
                name: "QuestName",
                value: this.fileName,
            })
            .setFooter({ text: "Quest Footer" })
            .setTimestamp();

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`${this.fileName}#help`)
                .setLabel("Help")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`${this.fileName}#let_be`)
                .setLabel("Let Be")
                .setStyle(ButtonStyle.Primary),
        );

        let msg = await questChannel.send({
            embeds: [builder],
            components: [actionRow],
        });
    }
}
