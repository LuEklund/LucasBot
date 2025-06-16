import { Message, type ButtonInteraction, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
import { ItemDB } from "@/models/item";
import { Globals } from "..";

export default class ShopQuest extends Quest.Base {
    public override buttons: AppButton[] = [];

    stock: number = 0;
    maxStock: number = 9;
    minStock: number = 2;

    public override async start(): Promise<Message<true>> {
        const embed = new EmbedBuilder()
            .setTitle("Shop")
            .setDescription("Come and buy some items!")
            .setColor("#A6F7CB")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1383456027084718122/iu.png?ex=684edb54&is=684d89d4&hm=ff0c3a78138fbd296021b6cbc72c973ba9e4ff7e7d213c277694fce1726ac129&",
            )
            .setURL(Globals.LINK);

        const store = new EmbedBuilder()
            .setTitle("Items")
            .setDescription("The item's that are for sale today!")
            .setColor("#A6F7CB")
            .setURL(Globals.LINK);

        this.stock = Math.floor(Math.random() * (this.maxStock - this.minStock)) + this.minStock;

        for (let i: number = 0; i < this.stock; i++) {
            const item: ItemDB.Document = (await ItemDB.getRandom())!;
            if (!item) {
                console.warn("Item is null");
                return Globals.CHANNEL.send("Something went wrong... concult a Adam");
            }

            let modifiers: string = "";
            if (item.flatModifiers.size! + item.percentageModifiers.size! !== 0) {
                modifiers = "Modifiers:\n";
                for (const [key, value] of Object.entries(item.flatModifiers ?? {})) {
                    if (value > 0) modifiers += `${key} **+${value}**,\n`;
                }
                modifiers += "\n";
                for (const [key, value] of Object.entries(item.percentageModifiers ?? {})) {
                    if (value > 0) modifiers += `${key} **+${value}%**,\n`;
                }
            }

            store.addFields({
                name: item.name,
                value: `Cost: ${item.cost} gold\n
                    Type: ${item.type}\n
                    ${modifiers}`,
                inline: true,
            });
            if (this.stock <= 4 && i % 2 === 0) store.addFields({ name: "\u200B", value: "\u200B", inline: true });

            const button = new AppButton(
                item.name,
                function (interaction: ButtonInteraction) {
                    ShopQuest.buy(interaction, item);
                }.bind(this),
            );

            this.buttons.push(button);
        }

        const actionRow = AppButton.createActionRow(this.buttons, 3);

        await Globals.CHANNEL.send({
            embeds: [embed],
        });

        return await Globals.CHANNEL.send({
            embeds: [store],
            components: actionRow,
        });
    }

    private static async buy(interaction: ButtonInteraction, item: ItemDB.Document): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);

        let message: { content: string } | null = null;

        const canBuy = user.inventory.gold >= item.cost;
        if (canBuy) await user.addGold(-item.cost).addItem(item).save();
        if (message != null)
            interaction.reply({
                content: (message as any).content,
                flags: "Ephemeral",
            });

        const article = "aeiou".includes(item.name.at(0)!.toLowerCase()) ? "an" : "a";

        const embed = new EmbedBuilder()
            .setTitle(`Purchase of ${item.name}`)
            .setDescription(
                canBuy
                    ? `You bought ${article} ${item.name} for ${item.cost} gold!`
                    : `${user.inventory.gold} gold is not enough to buy ${article} ${item.name} for ${item.cost} gold`,
            )
            .setColor(canBuy ? "#A6F7CB" : "#e63946")
            .setURL(Globals.LINK);

        await interaction.reply({
            embeds: [embed],
            flags: "Ephemeral",
        });
    }
}
