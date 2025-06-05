import { UserModel } from "@/models/user";
import { Quest } from "@/core/quest";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    EmbedBuilder,
    User,
    type Client,
    type TextChannel,
} from "discord.js";

export default class CrimeQuest extends Quest {
    private lastUser: string | undefined = undefined;

    public override onButtonInteract = async (
        _: Client,
        interaction: ButtonInteraction,
    ) => {
        if (interaction.customId === `${this.fileName}#leave`)
            return (await interaction.reply(
                `**${interaction.user.username}** let them go, nothing happened.`,
            ))
                ? true
                : true;
        else if (interaction.customId === `${this.fileName}#split`) {
            const user = await UserModel.findOne({ id: this.lastUser });
            const author = await UserModel.findOne({ id: interaction.user.id });
            if (!user || !author)
                return (await interaction.reply("Invalid user")) ? true : true; // if it works it works
            const steal = Math.floor(user.xp / 2);
            author.xp += steal;
            user.xp -= steal;
            interaction.reply(
                `**${interaction.user.username}** took ${steal} gold (which I'm assuming is supposed to be XP?)`,
            );
            return true;
        } else if (interaction.customId === `${this.fileName}#jail`) {
            // I don't have any way to implement this for testing but it should be relatively easy for you to add Lucas
            return true;
        }
        return false;
    };
    public override startQuest = async (client: Client): Promise<void> =>
        this.getQuestData().then(async (questData) => {
            if (!process.env.QUEST_CHANNEL_ID)
                throw new Error("QUEST_CHANNEL_ID is not defined in .env");
            const questChannel: TextChannel = (await client.channels.fetch(
                process.env.QUEST_CHANNEL_ID,
            )) as TextChannel;

            const users = Array.from(client.users.cache.keys());
            const offender = users[Math.floor(Math.random() * users.length)];

            this.lastUser = offender;

            const builder = new EmbedBuilder()
                .setTitle(questData.title)
                .setDescription(
                    questData.description
                        .replaceAll("\\n", "\n")
                        .replaceAll("$user", `<@${offender}>`),
                )
                .setColor("#0099ff")
                .setImage(questData.imageUrl)
                .addFields({
                    name: "Quest name",
                    value: this.fileName,
                })
                .setFooter({ text: "Quest Footer" })
                .setTimestamp();

            const actionRow =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${this.fileName}#leave`)
                        .setLabel("Let them go")
                        .setStyle(1),
                    new ButtonBuilder()
                        .setCustomId(`${this.fileName}#split`)
                        .setLabel("Split their gold")
                        .setStyle(1),
                    new ButtonBuilder()
                        .setCustomId(`${this.fileName}#jail`)
                        .setLabel("Send them to jail")
                        .setStyle(1),
                );

            questChannel.send({ embeds: [builder], components: [actionRow] });
        });
}
