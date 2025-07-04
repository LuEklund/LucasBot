import { Command } from "@/commands";
import { CommandInteraction, InteractionResponse, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { AppUser } from "../user";
import FightGame from "./Fight/fightGame";

export default class FightCommand extends Command.Base {
    public override main: Command.Command = new Command.Command(
        "fight",
        "Fight a player",
        [
            {
                name: "opponent",
                description: "The opponent to fight",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "bet",
                description: "how much money to bet (both players must be able to afford)",
                type: ApplicationCommandOptionType.Number,
                required: true,
                min_value: 0,
                max_value: 250,
            },
        ],
        this.onExecute.bind(this),
    );

    static games: Map<number, FightGame> = new Map<number, FightGame>();
    
    static endGameByID(ID: number) {
        const game = FightCommand.games.get(ID);
        if (game) {
            game.gameOver();
            FightCommand.games.delete(ID);
        }
    }

    public async onExecute(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const opponentOpt = interaction.options.get("opponent", true).user;
        if (!opponentOpt)
            return interaction.reply({ content: `Failed to get user option... wait how did you mess this up 😭`, ephemeral: true });

        if (opponentOpt.id === interaction.user.id)
            return interaction.reply({ content: `You can't fight yourself, mr. shadowboxer`, ephemeral: true });

        if (this.isUserPartOfFight(opponentOpt.id) || this.isUserPartOfFight(interaction.user.id))
            return interaction.reply({ content: `Hold up, someone's already throwing hands elsewhere. Wait your turn.`, ephemeral: true });

        const betOpt = interaction.options.get("bet", true).value as number;
        const opponentUser = await AppUser.fromID(opponentOpt.id);
        const currentUser = await AppUser.fromID(interaction.user.id);

        if (opponentUser.inventory.gold < betOpt || currentUser.inventory.gold < betOpt)
            return interaction.reply({
                content: `Nice try, but someone here is broke..... Cant fight without the monyon, my sonyon.`,
                ephemeral: true,
            });

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("👊 FIGHT CHALLENGE SENT!")
            .setDescription(`⚠️ ${currentUser.discord} has challenged ${opponentUser.discord} to a **fight**!\n💰 Bet: **${betOpt} gold**\n\nWaiting on ${opponentUser.discord} to accept...`)
            .setFooter({ text: "This fight boutta be FAT, JUICY and THICC 🔥" })
            .setTimestamp();

        const reply = await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });

        let newGame = new FightGame(currentUser, opponentUser, betOpt);
        newGame.sendInviteMessage();
        FightCommand.games.set(newGame.id, newGame);

        return reply;
    }

    isUserPartOfFight(userId: string) {
        for (const [id, game] of FightCommand.games!) {
            if (game.getAppUserByID(userId) !== undefined) {
                return game;
            }
        }
        return undefined;
    }
}
