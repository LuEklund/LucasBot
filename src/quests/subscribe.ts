import { Message, type ButtonInteraction, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
import { Globals } from "..";

export default class SubscribeQuest extends Quest.Base {
    public override buttons: AppButton[] = [
        new AppButton("Yes", this.onPressYes.bind(this)),
        new AppButton("No", this.onPressNo.bind(this)),
    ];
    players: string[] = [];

    xpRewardAmount: number = 10;

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);
        const embed = new EmbedBuilder()
            .setTitle("Subscribed")
            .setDescription("Are you subscribed to Lucas?")
            .setColor("#e63946")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1379101169892327434/subscribe-7403560_1280.png?ex=683f038d&is=683db20d&hm=6e7deb8d64bc3a019f13547c0c16191322469c463211f937dd0486783c1c9529&",
            )
            .setURL(Globals.LINK);

        return await Globals.CHANNEL.send({
            embeds: [embed],
            components: actionRow,
        });
    }

    private async onPressYes(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        if (this.hasPlayerReacted(user.discord.id)) {
            await interaction.reply({
                content: `you already gave your answer :]`,
                flags: "Ephemeral",
            });
            return;
        }
        await user.addXP(this.xpRewardAmount).save();

        await interaction.reply({
            content: `**Good 😊** You gained ${this.xpRewardAmount} XP! Now tell a friend?`,
            flags: "Ephemeral",
        });
    }

    private async onPressNo(interaction: ButtonInteraction): Promise<void> {
        if (this.hasPlayerReacted(interaction.user.id)) {
            await interaction.reply({
                content: `you already gave your answer :]`,
                flags: "Ephemeral",
            });
            return;
        }
        await interaction.reply({
            content: `What?... why are you here if you'r not even subscribed?!?!?`,
            flags: "Ephemeral",
        });
    }

    private hasPlayerReacted(playerID: string) {
        if (this.players.includes(playerID)) return true;
        this.players.push(playerID);
        return false;
    }
}
