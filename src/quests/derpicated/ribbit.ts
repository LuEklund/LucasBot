import { Message, ButtonInteraction, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
/**
 * TODO: Fix this quest, it doesnt work idk man its stupid, It might be because we arent storing the members or shit but I dont have the patiens for that ¯\_(ツ)_/¯
 */
export default class RibbitQuest extends Quest.Base {
    public override buttons: AppButton[] = [
        new AppButton("Steal", this.onPressSteal),
        new AppButton("Help", this.onPressHelp),
    ];

    ribbit: string = undefined!;

    maxStealReward: number = 250;
    minStealReward: number = 5;
    helpCost: number = 250;

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);

        const guild = await Quest.channel.guild.fetch();
        const fetchedMembers = await guild.members.fetch();
        const members = Array.from(fetchedMembers.keys());
        if (members.length === 0) console.warn("No members found in the guild.");

        const ribbit = (await members[Math.floor(Math.random() * members.length - 1)]) || "402859016457420820";
        if (!ribbit) console.warn("Failed to get user");

        this.ribbit = ribbit;

        await (await AppUser.fromID(this.ribbit)).addSkillPoints(1).save();

        const embed = new EmbedBuilder()
            .setTitle("Ribbit")
            .setDescription(`A random ribbit named ${ribbit} is found unconscious on the road what do you do?`)
            .setColor("#7FFF00")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1383753635036663848/image.png?ex=684ff07f&is=684e9eff&hm=2c1962b252cab02ea1d8e960b09cd621ff24febd9e1bbf1c2cd79bf4e47dbf48&",
            )
            .setURL(Quest.link);

        return await Quest.channel.send({
            embeds: [embed],
            components: actionRow,
        });
    }

    private async onPressSteal(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        const ribbit = await AppUser.fromID(this.ribbit);
        console.log(ribbit);

        const stealReward: number =
            Math.floor(Math.random() * (this.maxStealReward - this.minStealReward)) + this.minStealReward;

        await ribbit.addGold(-stealReward).save();
        await user.addGold(stealReward).save();

        interaction.reply({
            content: `You gained ${stealReward} gold by stealing from the ribbit`,
            flags: "Ephemeral",
        });
    }

    private async onPressHelp(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        const ribbit = await AppUser.fromID(this.ribbit);

        await ribbit.addGold(this.helpCost).save();
        await user.addGold(-this.helpCost).addSkillPoints(0.25).save();

        await interaction.reply({
            content: `You helped the ribbit and bought a room for 1 night at a 1 star motel ${-this.helpCost} gold!`,
            flags: "Ephemeral",
        });
    }
}
