import { Message, type ButtonInteraction, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
import { Globals } from "..";

export default class UnstablePortalQuest extends Quest.Base {
    public override buttons: AppButton[] = [
        new AppButton("Enter", this.onPressEnter.bind(this)),
        new AppButton("Destroy", this.onPressDestroy.bind(this)),
    ];

    goldReward: number = 10;
    isDestroyed: boolean = false;

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);
        const embed = new EmbedBuilder()
            .setTitle("Unstable Portal")
            .setDescription(
                "A shimmering portal has appeared! Strange energy pulses from within. Try to enter the portal based on ✨magic. Or destroy the portal and receive a reward 100% success rate",
            )
            .setColor("#0099ff")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1382031141577425076/WEQ4VWpwSE5RPQ.png?ex=6849ac4d&is=68485acd&hm=4cc8f7af4c76a4fd083f4eafb50935fc5e07dec05be3c742b0c25336f33aee8f&",
            )
            .setURL(Globals.LINK);

        return await Globals.CHANNEL.send({
            embeds: [embed],
            components: actionRow,
        });
    }

    private async onPressEnter(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);

        const successfullyEnterdPortal: boolean =
            Math.floor(Math.random() * 100 - user.database.stats.magicka * 0.01) > 99;
        const successfullyEarnLoot: boolean = Math.random() > 0.5;
        const destroyedPortal: boolean = Math.random() > 0.6;

        const goldAmount = Math.floor(Math.random() * this.goldReward);

        if (successfullyEarnLoot) await user.addGold(goldAmount).save();

        await interaction.reply({
            content: this.isDestroyed
                ? "You can't enter the portal anymore... someone destroyed it!"
                : `You ${successfullyEnterdPortal ? "successfully" : "unsuccessfully"} entered the portal${!successfullyEarnLoot ? "!" : ` and you got ${goldAmount} ${Globals.ATTRIBUTES.gold.emoji}`}`,
            flags: "Ephemeral",
        });
        if (destroyedPortal) this.end();
    }

    private async onPressDestroy(interaction: ButtonInteraction): Promise<void> {
        await interaction.reply({
            content: this.isDestroyed
                ? "You can't destroy the portal anymore... someone destroyed it!"
                : "You destroyed the portal!",
            flags: "Ephemeral",
        });
        if (this.isDestroyed == false) this.end();
    }

    public override async end(): Promise<Quest.EndReturn> {
        this.isDestroyed = true;
        const embed = new EmbedBuilder()
            .setTitle("Unstable Portal")
            .setDescription("Someone... Destroyed the portal???")
            .setColor("#0099ff")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1382031141577425076/WEQ4VWpwSE5RPQ.png?ex=6849ac4d&is=68485acd&hm=4cc8f7af4c76a4fd083f4eafb50935fc5e07dec05be3c742b0c25336f33aee8f&",
            )
            .setURL(Globals.LINK);

        await this.message.edit({
            embeds: [embed],
        });
        return Quest.end(this.name);
    }
}
