import { Message, ButtonInteraction, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
import { Globals } from "..";

export default class TimmyQuest extends Quest.Base {
    public override buttons: AppButton[] = [
        new AppButton("Help", this.onPressHelp),
        new AppButton("Kill", this.onPressKill),
    ];

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);

        const embed = new EmbedBuilder()
            .setTitle("Timmy")
            .setDescription("You walk in the woods and find a boy called Timmy, he askes you for help. What do you do?")
            .setColor("#F5F5DC")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1383754297577312336/PQ.png?ex=684ff11d&is=684e9f9d&hm=369feadc4b3454614717544f60e6fa670a62e0ddc5f079be7d2655722d4edb58&",
            )
            .setURL(Globals.LINK);

        return await Globals.CHANNEL.send({
            embeds: [embed],
            components: actionRow,
        });
    }

    private async onPressHelp(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);

        user.database.stats.strength -= 1;
        user.database.stats.charisma -= 1;
        await user.save();
        interaction.reply({
            content: `You helped but you also lost -1 strengh, -1 charisma`,
            flags: "Ephemeral",
        });
    }

    private async onPressKill(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);

        await user.addGold(100).save();

        await interaction.reply({
            content: `Bastard, but you gain 100 gold`,
            flags: "Ephemeral",
        });
    }
}
