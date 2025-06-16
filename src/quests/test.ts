import { ButtonInteraction, Message } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { Globals } from "..";

export default class TestQuest extends Quest.Base {
    public override buttons: AppButton[] = [new AppButton("Test Label", this.onPressTest.bind(this))];

    amount: number = 0;

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);

        return await Globals.CHANNEL.send({
            content: "Test!!!",
            components: actionRow,
        });
    }

    public override async end(): Promise<Quest.EndReturn> {
        return Quest.end(this.name);
    }

    private async onPressTest(interaction: ButtonInteraction): Promise<void> {
        this.amount += 1;
        await interaction.reply({
            content: `Added 1 to the amount, new amount is now ${this.amount}`,
            flags: "Ephemeral",
        });

        if (this.amount >= 3) this.end();

        this.message.edit({
            content: this.amount >= 3 ? `Final amount was: ${this.amount}` : `Amount is now: ${this.amount}`,
        });
    }
}
