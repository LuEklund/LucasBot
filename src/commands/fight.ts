import { Command } from "@/commands";
import { CommandInteraction, InteractionResponse, ApplicationCommandOptionType } from "discord.js";
import { AppUser } from "../user";
import FightGame from "./Fight/fightGame";

export default class FightCommand extends Command.Base {
    // prettier-ignore
    public override main: Command.Command = new Command.Command(
        "fight", "Fight a player", 
        [
            {
                name: "opponent",
                description: "The opponent to fight",
                type: ApplicationCommandOptionType.User,
                required:true
            },
            {
                name: "bet",
                description: "how much money to bet (both players must be able to afford)",
                type: ApplicationCommandOptionType.Number,
                required:true,
                min_value: 0,
                max_value: 100
            }
        ],
        this.onExecute.bind(this),
    );
    games: Map<number, FightGame> = new Map<number, FightGame>();

    public async onExecute(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const opponentOpt = interaction.options.get("opponent", true).user;
        if (!opponentOpt) return interaction.reply({ content: `Failed to get user option`, flags: "Ephemeral" });
        if (opponentOpt.id === interaction.user.id) return interaction.reply({ content: `You cant fight youself`, flags: "Ephemeral" });
        if (this.isUserPartOfFight(opponentOpt.id) || this.isUserPartOfFight(interaction.user.id))
            return interaction.reply({ content: `One of the players are already in a fight`, flags: "Ephemeral" });

        const betOpt = interaction.options.get("bet", true).value as number;
        const opponentUser = await AppUser.fromID(opponentOpt.id);
        const currentUser = await AppUser.fromID(interaction.user.id);
        if (opponentUser.inventory.gold < betOpt || currentUser.inventory.gold < betOpt)
            return interaction.reply({ content: `One of the players cant afford the bet`, flags: "Ephemeral" });

        const reply = await interaction.reply(`${interaction.user} Fight invite sent to ${opponentUser.discord}`);

        let newGame = new FightGame(currentUser, opponentUser, betOpt);
        newGame.sendInviteMessage();
        this.games.set(newGame.id, newGame);
        return reply;
    }

    isUserPartOfFight(userId: string) {
        for (const [id, game] of this.games!) {
            if (game.getAppUserByID(userId) !== undefined) {
                return game;
            }
        }
        return undefined;
    }
}
