import { type ButtonInteraction, type Message, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { ItemDB } from "@/models/item";
import { AppUser } from "@/user";
import { Globals } from "..";

export default class PackageQuest extends Quest.Base {
    public override buttons: AppButton[] = [
        new AppButton("Open it immediately", this.onPressOpen.bind(this)),
        new AppButton("Find the owner", this.onPressOwner.bind(this)),
        new AppButton("Sell it", this.onPressSell.bind(this)),
    ];

    maxGoldReward = 10;

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);

        const embed = new EmbedBuilder()
            .setTitle("Mysterious Package")
            .setDescription("There is a small, unmarked package. What do you do?")
            .setColor("#C1A471")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1382015780383887360/MysteryBox.png?ex=68499dfe&is=68484c7e&hm=a0acba79ae199869576e87d66f3e834c31d389f707d6083a7199a1dd70100e60&",
            )
            .setURL(Globals.LINK);

        return await Globals.CHANNEL.send({
            embeds: [embed],
            components: actionRow,
        });
    }

    public override async end(): Promise<Quest.EndReturn> {
        return Quest.end(this.name);
    }

    private async onPressOpen(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        await interaction.deferUpdate();

        const item = await ItemDB.getRandom();
        if (!item) return;
        const itemInfo: string = `${item.name} worth ${item.cost} ${Globals.ATTRIBUTES.gold.emoji}`;

        await user.addItem(item).save();

        const embed = new EmbedBuilder()
            .setTitle("Mysterious Package")
            .setDescription(`${user.discord} opened the package and found a ${itemInfo}`)
            .setColor("#C1A471")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            embeds: [embed],
        });

        this.end();
    }

    private async onPressOwner(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        await interaction.deferUpdate();
        const goldAmount = Math.random() * this.maxGoldReward;

        let gainSkillPoint = false;
        if (user.database.stats.charisma * Math.random() > 0) {
            gainSkillPoint = true;
            user.addSkillPoints(1);
        }
        await user.addGold(goldAmount).save();

        const embed = new EmbedBuilder()
            .setTitle("Mysterious Package")
            .setDescription(
                `${user.discord} found the owner of the package, and received ${goldAmount.toFixed(2)} ${Globals.ATTRIBUTES.gold.emoji} ${gainSkillPoint ? ` And 1x${Globals.ATTRIBUTES.skillpoint.emoji}` : ""}`,
            )
            .setColor("#C1A471")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            embeds: [embed],
        });

        this.end();
    }

    private async onPressSell(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        await interaction.deferUpdate();
        const goldAmount = Math.random() * this.maxGoldReward * 2;

        await user.addGold(goldAmount).save();

        const embed = new EmbedBuilder()
            .setTitle("Mysterious Package")
            .setDescription(
                `${user.discord} found a buyer of the package, and recived ${goldAmount.toFixed(2)} ${Globals.ATTRIBUTES.gold.emoji}`,
            )
            .setColor("#C1A471")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            embeds: [embed],
        });

        this.end();
    }
}
