import { Message, type ButtonInteraction, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/ui";
import { AppUser } from "@/user";
import { Globals } from "..";

export default class BanditAmbushQuest extends Quest.Base {
    public override buttons: AppButton[] = [new AppButton("Help", this.onPressHelp.bind(this))];

    players: string[] = [];
    maxPlayers: number = 5;

    difculty: number = Globals.random(1, 5);
    reward: number = this.difculty * 10;
    penalty: number = this.reward / 10;

    public override async start(): Promise<Message<true>> {
        const actionRow = AppButton.createActionRow(this.buttons);
        const embed = new EmbedBuilder()
            .setTitle("Bandit Ambush")
            .setDescription("A group of bandits is harassing travelers on the road")
            .setColor("#e63946")
            .setImage(
                "https://cdn.discordapp.com/attachments/1379101132743250082/1384138103001714688/Banditss.jpg?ex=6851568f&is=6850050f&hm=5782b862522ef4944d259b633729c39bd027def90a81ddbd22ce54da9a0d9415&",
            )
            .setURL(Globals.LINK);

        const lobby = new EmbedBuilder()
            .setTitle("Lobby")
            .setDescription(`0/${this.maxPlayers} players joined so far!`)
            .setColor("#e63946")
            .setURL(Globals.LINK);

        await Globals.CHANNEL.send({
            embeds: [embed],
        });

        return await Globals.CHANNEL.send({
            embeds: [lobby],
            components: actionRow,
        });
    }

    public override async end() {
        const users: AppUser[] = [];
        for (const index in this.players) users.push(await AppUser.fromID(this.players[index]!));

        let playerStrength: number = 0;

        users.forEach((user) => {
            playerStrength += user.getStat("strength");
        });

        playerStrength = Globals.randomFloat(0, playerStrength);
        const banditsStrengh = this.difculty * 3.5;

        const playersWon = playerStrength > banditsStrengh;

        if (playersWon) users.forEach(async (user) => await user.addGold(this.reward).addXP(this.reward).save());
        else
            users.forEach(async (user) => {
                await user.addGold(-this.penalty).save();
            });

        const embed = new EmbedBuilder()
            .setTitle("Result")
            .setDescription(
                playersWon
                    ? `The players won over the bandits!\n All players recived: ${this.reward} ${Globals.ATTRIBUTES.gold.emoji}!`
                    : `The bandits won over the players and stole ${this.penalty}${Globals.ATTRIBUTES.gold.emoji} From each player` +
                          `\n\nBndits strengh: ${banditsStrengh.toFixed(2)}, player strengh: ${playerStrength.toFixed(2)}`,
            )
            .setColor("#e63946")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            embeds: [embed],
        });
    }

    private async onPressHelp(interaction: ButtonInteraction): Promise<void> {
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
            content: `You have decided to join the rescue party for the villager!`,
            flags: "Ephemeral",
        });

        const lobby = new EmbedBuilder()
            .setTitle("Lobby")
            .setDescription(`${this.players.length}/${this.maxPlayers} players joined so far!`)
            .setColor("#e63946")
            .setURL(Globals.LINK)
            .toJSON();

        this.message.edit({
            embeds: [lobby],
        });

        if (this.players.length >= this.maxPlayers) Quest.end(this.name);
    }
}
