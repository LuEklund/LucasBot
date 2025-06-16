import { Message, type ButtonInteraction, EmbedBuilder, ButtonStyle } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
import { Globals } from "..";

export default class SubscribePortalQuest extends Quest.Base {
    public override buttons: AppButton[] = [
        new AppButton("Red 🔴", this.onPressRed.bind(this), ButtonStyle.Danger),
        new AppButton("Blue 🔵", this.onPressBlue.bind(this)),
    ];

    bet: number = 5;
    teamRed: Array<string> = new Array();
    teamBlue: Array<string> = new Array();
    mainEmbed?: EmbedBuilder;

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);
        this.mainEmbed = new EmbedBuilder()
            .setTitle("Red vs Blue")
            .setDescription(`Pick a color costs ${this.bet} gold to participate. Winners split the amount!`)
            .setColor("#800080")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1382038199978688603/RedVsBlue.png?ex=6849b2df&is=6848615f&hm=bf4a2d2384a06f05254a556bc21afa61d7dc3ef327b0cb224dec387fb0650341&",
            )
            .setURL(Globals.LINK);

        return await Globals.CHANNEL.send({
            embeds: [this.mainEmbed],
            components: actionRow,
        });
    }

    public override async end(): Promise<Quest.EndReturn> {
        let winningTeam = this.teamRed;
        let winningTeamName = "red";
        if (Math.random() > 0.5) {
            winningTeam = this.teamBlue;
            winningTeamName = "blue";
        }

        const goldPerUser = ((this.teamRed.length + this.teamBlue.length) * this.bet) / winningTeam.length;
        let formatedWinners: string = "";
        for (const teammate of winningTeam) {
            const user = await AppUser.fromID(teammate);
            user.addGold(goldPerUser).save();
            formatedWinners += `${user.discord}, `;
        }
        const embed = new EmbedBuilder()
            .setTitle(`Team ${winningTeamName} wins!`)
            .setDescription(`Winners: ${formatedWinners}\nGot ${goldPerUser}${Globals.ATTRIBUTES.gold.emoji} each!`)
            .setColor(winningTeamName === "red" ? "#FF0000" : "#0000FF")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            embeds: [embed],
        });

        return Quest.end(this.name);
    }

    private async onPressRed(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        if (user.inventory.gold < this.bet) {
            await interaction.reply({
                content: `You do not have enough gold to participate, the required amount is ${this.bet} and you have ${user.inventory.gold}`,
                flags: "Ephemeral",
            });
            return;
        }

        const currentUserTeam = this.teamRed.includes(user.discord.id) ? true : this.teamBlue.includes(user.discord.id);
        if (currentUserTeam) {
            await interaction.reply({
                content: `You're already in team ${currentUserTeam}!`,
                flags: "Ephemeral",
            });
            return;
        }

        this.teamRed.push(user.discord.id);
        user.addGold(-this.bet).save();
        await interaction.reply({
            content: `You joined team red!`,
            flags: "Ephemeral",
        });
    }

    private async onPressBlue(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);
        if (user.inventory.gold < this.bet) {
            await interaction.reply({
                content: `You do not have enough gold to participate, the required amount is ${this.bet} and you have ${user.inventory.gold}`,
                flags: "Ephemeral",
            });
            return;
        }

        const currentUserTeam = this.teamBlue.includes(user.discord.id) ? true : this.teamRed.includes(user.discord.id);
        if (currentUserTeam) {
            await interaction.reply({
                content: `You're already in team ${currentUserTeam}!`,
                flags: "Ephemeral",
            });
            return;
        }

        this.teamBlue.push(user.discord.id);
        user.addGold(-this.bet).save();
        await interaction.reply({
            content: `You joined team blue!`,
            flags: "Ephemeral",
        });
    }
}
