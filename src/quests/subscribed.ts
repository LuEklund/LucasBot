import { giveXP, UserModel } from "@/models/user";
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

export default class SubscribedQuest extends Quest {
    public override async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (interaction.customId === `${this.fileName}#yes`) {
            const xpRecived = await giveXP(interaction.user.id, 10);
            let message = await interaction.reply(
                "**" +
                    interaction.member?.user.username +
                    "**" +
                    " Good 😊 \nYou gained " +
                    xpRecived?.toFixed(2) +
                    "xp! \nNow tell a friend?",
            );

            return true;
        } else if (interaction.customId === `${this.fileName}#no`) {
            let message = await interaction.reply(
                "**" +
                    interaction.member?.user.username +
                    "**" +
                    " How could you? 😭 \nYou lost 10xp!",
            );
            await giveXP(interaction.user.id, -10);
            return true;
        }

        return false;
    }

    public override async startQuest(client: Client): Promise<void> {
        const questData = await this.getQuestData();

        questData.data;

        if (!process.env.QUEST_CHANNEL_ID)
            throw new Error("QUEST_CHANNEL_ID is not defined in .env");
        let questChannel: TextChannel = (await client.channels.fetch(
            process.env.QUEST_CHANNEL_ID,
        )) as TextChannel;

        const builder = new EmbedBuilder()
            .setTitle(questData.title)
            .setDescription(questData.description.replace(/\\n/g, "\n"))
            .setColor("#0099ff")
            .setImage(questData.imageUrl)
            .setURL("https://www.youtube.com/@LucasDevelop")
            .addFields({
                name: "QuestName",
                value: this.fileName,
            })
            .setFooter({ text: "Quest Footer" })
            .setTimestamp();

        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`${this.fileName}#yes`)
                .setLabel("YES")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`${this.fileName}#no`)
                .setLabel("NO")
                .setStyle(ButtonStyle.Primary),
        );

        let msg = await questChannel.send({
            embeds: [builder],
            components: [actionRow],
        });
    }
}
