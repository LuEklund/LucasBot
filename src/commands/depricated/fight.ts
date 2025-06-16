import { Command } from "@/command";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    User,
    type Client,
    type CommandInteraction,
    type InteractionUpdateOptions,
} from "discord.js";
import FightGame from "./fight/fightGame";
import { getFieldImage } from "./fight/fieldGenerate";
import type Fighter from "./fight/fighter";
import { Item } from "@/models/item";

interface PlayerDisplay {
    name: string;
    value: string;
    inline: boolean;
}

export default class FightCommand extends Command.Base {
    games: Map<number, FightGame> = new Map<number, FightGame>();

    override get info(): any {
        return new SlashCommandBuilder()
            .setName("fight")
            .setDescription("fight a player")
            .addUserOption((option) =>
                option.setName("opponent").setDescription("The opponent to fight").setRequired(true),
            )
            .addNumberOption((option) =>
                option
                    .setName("bet")
                    .setDescription("how much money to bet (both players must be able to afford)")
                    .setMinValue(0)
                    .setMaxValue(100)
                    .setRequired(true),
            )
            .toJSON();
    }

    isUserPartOfFight(userId: string): FightGame | undefined {
        for (const [id, game] of this.games!) {
            if (game.getDiscordUserById(userId) !== undefined) {
                return game;
            }
        }
        return undefined;
    }

    public override async onButtonInteract(client: Client, interaction: ButtonInteraction): Promise<boolean> {
        let currentGame: FightGame | undefined = this.isUserPartOfFight(interaction.user.id);
        if (currentGame === undefined) {
            return false;
        }
        await interaction.deferUpdate();

        if (interaction.customId === currentGame.id + "#end") {
            //TODO REMOVE TEST BUTTON
            interaction.editReply({
                content: `The fight was ended by ${interaction.user.username}.`,
                components: [],
            });
            currentGame.gameOver(false);
            this.games.delete(currentGame.id);
            return false;
        }
        if (currentGame.isValidCombatMovement(interaction.user.id)) {
            if (interaction.customId === currentGame.id + "#moveLeft") {
                currentGame.movePlayer("left");
                interaction.editReply(await this.getFightDisplayOptions("Moved left", currentGame));
            } else if (interaction.customId === currentGame.id + "#moveRight") {
                currentGame.movePlayer("right");
                interaction.editReply(await this.getFightDisplayOptions("Moved right", currentGame));
            } else if (interaction.customId === currentGame.id + "#attack") {
                const actionInfo: string = currentGame.playerAttack();
                interaction.editReply(await this.getFightDisplayOptions("Attacked\n" + actionInfo, currentGame));
                if (currentGame.getNextPlayer().currentHealth <= 0) {
                    currentGame.gameOver(true);
                    this.games.delete(currentGame.id);
                    return true;
                }
            } else if (interaction.customId === currentGame.id + "#flee") {
                if (currentGame.playerFlee()) {
                    interaction.editReply({
                        content: `The fight is over! ${currentGame.getCurrentPlayer().dbUser!.username} escaped!`,
                        components: [],
                    });
                    currentGame.gameOver(false);
                    this.games.delete(currentGame.id);
                } else {
                    interaction.editReply(
                        await this.getFightDisplayOptions(
                            `${currentGame.getCurrentPlayer().dbUser!.username} Failed to flee!`,
                            currentGame,
                        ),
                    );
                }
            } else if (interaction.customId === currentGame.id + "#sleep") {
                const manaAndHealthGainedMsg = currentGame.playerSleep();
                interaction.editReply(await this.getFightDisplayOptions(manaAndHealthGainedMsg, currentGame));
            }

            currentGame.nextTurn();

            return true;
        } else {
            if (interaction.customId === currentGame.id + "#acceptFight") {
                const res = await currentGame.initGame(interaction.user.id);
                if (res.success) {
                    await interaction.editReply(await this.getFightDisplayOptions(res.reason, currentGame));
                    currentGame.nextTurn();
                } else {
                    interaction.followUp({
                        content: res.reason,
                        components: [],
                        flags: "Ephemeral",
                    });
                    return true;
                }
            } else if (interaction.customId === currentGame.id + "#declineFight") {
                interaction.editReply({
                    content: `The fight was cancelled by ${interaction.user.username}.`,
                    components: [],
                });
                this.games.delete(currentGame.id);
                return true;
            }
        }

        return false;
    }

    getPlayerDisplay(player: Fighter, healthbar: string, manaBar: string): PlayerDisplay {
        const itemsDisplay = Item.getStringCollection(player.items);

        return {
            name: `${player.dbUser!.username}'s Status`,
            value:
                `❤️ Health: ${healthbar}\n` +
                `🔵 Mana: ${manaBar}\n` +
                `⚔️ Strength: **${player.fighterStats.strength}**\n` +
                `🛡️ Defense: **${player.fighterStats.defense}**\n` +
                `🏃 Agility: **${player.fighterStats.agility}** \n` +
                `✨ Magicka: **${player.fighterStats.magicka}**\n` +
                `🔋 Vitality: **${player.fighterStats.vitality}**\n` +
                `🏃‍♂️ Stamina: **${player.fighterStats.stamina}**\n` +
                `🗣️ Charisma: **${player.fighterStats.charisma}**\n` +
                `📦 Items: \n${itemsDisplay}`,
            inline: true,
        };
    }

    async createStatBar(
        current: number,
        max: number,
        length: number = 10,
        filledColorCode: string = "31",
    ): Promise<string> {
        if (max <= 0) return ":no_entry_sign: ";
        const percentage = current / max;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        const filledBar = "█".repeat(filled);
        const emptyBar = " ".repeat(empty);
        // Using ANSI code block for better visual consistency of the bar
        return `${current.toFixed(2)}/${max.toFixed(2)}\`\`\`ansi\n[2;${filledColorCode}m${filledBar}[0m[2;37m${emptyBar}[0m\n\`\`\` `;
    }

    private async getFightDisplayOptions(action: string, currentGame: FightGame): Promise<InteractionUpdateOptions> {
        const currentPlayer = currentGame.getCurrentPlayer();
        const nextPlayer = currentGame.getNextPlayer();
        const player1 = currentGame.getPlayers()[0]!;
        const player2 = currentGame.getPlayers()[1]!;
        const player1HealthBar = await this.createStatBar(
            player1.currentHealth,
            player1.getMaxHealthStats(),
            player1.getMaxHealthStats(),
            "31",
        );
        const player1ManaBar = await this.createStatBar(
            player1.currentMana,
            player1.getMaxManaStats(),
            player1.getMaxManaStats(),
            "34",
        );
        const player2HealthBar = await this.createStatBar(
            player2.currentHealth,
            player2.getMaxHealthStats(),
            player2.getMaxHealthStats(),
            "31",
        );
        const player2ManaBar = await this.createStatBar(
            player2.currentMana,
            player2.getMaxManaStats(),
            player2.getMaxManaStats(),
            "34",
        );
        const player1DisplayStats = this.getPlayerDisplay(player1, player1HealthBar, player1ManaBar);
        const player2DisplayStats = this.getPlayerDisplay(player2, player2HealthBar, player2ManaBar);
        const fieldImageAttachment = await getFieldImage(currentGame);
        const builder = new EmbedBuilder()
            .setColor(0x0099ff)
            .setAuthor({
                name: `It's ${nextPlayer.dbUser!.username}'s Turn!`,
                iconURL: nextPlayer.imgeUrl,
            })
            .setDescription(currentPlayer.dbUser?.username + ": " + action)
            .setImage("attachment://game-field.png")
            .addFields(player1DisplayStats, player2DisplayStats)
            .setFooter({
                text: `➡️ It's ${nextPlayer.dbUser!.username}'s Turn!`,
                iconURL: nextPlayer.imgeUrl,
            })
            .setTimestamp();
        const allowActionsButtons = nextPlayer.currentMana < 1;
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            nextPlayer.posX === 0
                ? new ButtonBuilder()
                      .setCustomId(currentGame.id + "#flee")
                      .setLabel("Flee")
                      .setStyle(ButtonStyle.Danger)
                      .setDisabled(allowActionsButtons)
                : new ButtonBuilder()
                      .setCustomId(currentGame.id + "#moveLeft")
                      .setLabel("<<<")
                      .setStyle(ButtonStyle.Primary)
                      .setDisabled(allowActionsButtons),
            new ButtonBuilder()
                .setCustomId(currentGame.id + "#attack")
                .setLabel("Attack")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(allowActionsButtons),
            nextPlayer.posX === currentGame.arenaSize - 1
                ? new ButtonBuilder()
                      .setCustomId(currentGame.id + "#flee")
                      .setLabel("Flee")
                      .setStyle(ButtonStyle.Danger)
                      .setDisabled(allowActionsButtons)
                : new ButtonBuilder()
                      .setCustomId(currentGame.id + "#moveRight")
                      .setLabel(">>>")
                      .setStyle(ButtonStyle.Primary)
                      .setDisabled(allowActionsButtons),
            new ButtonBuilder()
                .setCustomId(currentGame.id + "#sleep")
                .setLabel("sleep")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(currentGame.id + "#end")
                .setLabel("End Fight (TEST)")
                .setStyle(ButtonStyle.Primary),
        );

        return {
            embeds: [builder],
            files: [fieldImageAttachment],
            components: [actionRow],
        };
    }

    private InitiateFight(user1: User, user2: User, game: FightGame) {
        const builder = new EmbedBuilder()
            .setTitle(`:crossed_swords: ${user1?.displayName} -VS- ${user2?.displayName} :crossed_swords:`)
            .setDescription(`:moneybag:**Bet: ${game.bet}**\n${user2} do you accept the fight?`)
            .setTimestamp();
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(game.id + "#acceptFight")
                .setLabel("Accept Fight")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(game.id + "#declineFight")
                .setLabel("Decline Fight")
                .setStyle(ButtonStyle.Danger),
        );
        return {
            embeds: [builder],
            components: [actionRow],
        };
    }

    override async executeCommand(client: Client, interaction: CommandInteraction): Promise<void> {
        if (interaction.user === interaction.options.get("opponent")?.user) {
            interaction.reply({
                content: "You cannot fight yourself!",
                flags: "Ephemeral",
            });
            return;
        }

        const otherUser = interaction.options.get("opponent")?.user || interaction.user;
        if (this.isUserPartOfFight(interaction.user.id) !== undefined) {
            interaction.reply({
                content: "You are already in a fight!",
                flags: "Ephemeral",
            });
            return;
        }
        if (this.isUserPartOfFight(otherUser.id) !== undefined) {
            interaction.reply({
                content: `${otherUser.username} is already in a fight!`,
                flags: "Ephemeral",
            });
            return;
        }
        let newGame = new FightGame(
            interaction.user,
            otherUser,
            parseInt(String(interaction.options.get("bet")?.value || 0)),
        );
        this.games.set(newGame.id, newGame);
        let msg = this.InitiateFight(interaction.user, otherUser, newGame);
        interaction.reply({
            embeds: msg.embeds,
            components: msg.components,
        });
    }
}
