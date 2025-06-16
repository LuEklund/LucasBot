import { type ButtonInteraction, type Message, EmbedBuilder, ButtonStyle } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
import { Globals } from "..";

export default class DragonCampaignQuest extends Quest.Base {
    public override buttons: AppButton[] = [new AppButton("Join", this.onPressJoin.bind(this))];

    players: string[] = [];

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);

        const embed = new EmbedBuilder()
            .setTitle("Dragon Campaign")
            .setDescription(
                `The ancient beast now haunts the skies of Lucamon\n
                casting shadows over villages and scorching the land with fire\n\n
                🛡️ Brave adventurers may answer the call\n
                💎 Great rewards await those who succeed\n\n
                ⚔️ Combine your party's Strength, Magic, Agility, and Defense to stand a chance. Your teamwork determines the outcome:\n
                Survivors gain legendary treasure. Dare to fight the beast — or watch Lucamon fall`,
            )
            .setColor("#FF4500")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1381274300987867216/CoolDragon.jpg?ex=6846eb70&is=684599f0&hm=a901607a7f42b3970f60320d16dee2c04ce655201aa8df64ef123829d5e0bc47&",
            )
            .setURL(Globals.LINK);

        const lobby = new EmbedBuilder()
            .setTitle("Lobby")
            .setDescription("No players have joined yet!")
            .setColor("#FF4500")
            .setURL(Globals.LINK);

        await Globals.CHANNEL.send({
            embeds: [embed],
        });
        return await Globals.CHANNEL.send({
            embeds: [lobby],
            components: actionRow,
        });
    }

    public override async end(): Promise<Quest.EndReturn> {
        const users: AppUser[] = [];
        for (const index in this.players) users.push(await AppUser.fromID(this.players[index]!));

        let playerStrength: number = 0;

        users.forEach((user) => {
            const stats = user.database.stats;
            playerStrength +=
                stats.strength + stats.agility + stats.stamina + stats.magicka + stats.defense + stats.vitality;
        });

        // TODO: Make balancing better maybe idk
        const avgStrength = playerStrength / users.length;

        const min = Math.max(10, playerStrength - users.length * users.length);
        const max = Math.max(min + 1, avgStrength * playerStrength * Math.abs(Math.sin(Math.random())));

        const dragonStrength = Math.floor((Math.random() * (max - min + 1) + min) / 4);

        const playersWon = playerStrength > dragonStrength;
        let msg = "The dragon won against the players";
        if (playersWon)
            msg = `The players won over the dragon!\nRewards:\n1x${Globals.ATTRIBUTES.skillpoint.emoji}\n10${Globals.ATTRIBUTES.gold.emoji} * ${Globals.ATTRIBUTES.charisma.emoji}\n10${Globals.ATTRIBUTES.xp.emoji} * ${Globals.ATTRIBUTES.gold.emoji}`;
        users.forEach(async (user) => {
            await user
                .addSkillPoints(1)
                .addXP(10 * user.database.stats.charisma)
                .addGold(10 * user.database.stats.charisma)
                .save();
        });

        const embed = new EmbedBuilder()
            .setTitle("Result")
            .setDescription(
                `${msg}\n
                Player strengh was ${playerStrength}, dragon strengh was ${dragonStrength}`,
            )
            .setColor("#FF4500")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            embeds: [embed],
        });

        return Quest.end(this.name);
    }

    private async onPressJoin(interaction: ButtonInteraction): Promise<void> {
        const user = await AppUser.fromID(interaction.user.id);

        for (const index in this.players) {
            if (user.discord.id == this.players[index]) {
                await interaction.reply({
                    content: `You are already in the lobby!`,
                    flags: "Ephemeral",
                });
                return;
            }
        }

        this.players.push(user.discord.id);
        await interaction.reply({
            content: `You joined the campaign!`,
            flags: "Ephemeral",
        });

        let joinedPlayerString: string = "";

        for (const index in this.players)
            joinedPlayerString += `${(await AppUser.fromID(this.players[index]!)).discord}, `;

        const joinedPlayersEmbed = new EmbedBuilder()
            .setTitle("Lobby")
            .setDescription(`Players: ${joinedPlayerString}`)
            .setColor("#FF4500")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            content: "",
            embeds: [joinedPlayersEmbed],
        });
    }
}
