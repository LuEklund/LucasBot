import { Command } from "@/command";
import { getUserFromId, giveGold, type UserDocument } from "@/models/user";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

class Fighter {
    dbUser?: UserDocument;
    posX: number = 0;
    currentHealth: number = 0;
    imgeUrl: string = "";

    constructor(dbUser: UserDocument, startPosition: number, imgUrl: string) {
        this.dbUser = dbUser;
        this.posX = startPosition;
        this.currentHealth = this.getMaxHealthStats();
        this.imgeUrl = imgUrl;
    }

    getMaxHealthStats(): number {
        return (this.dbUser?.vitality || 1) * 10;
    }
    attack(opponent: Fighter) {
        if (Math.abs(this.posX - opponent.posX) < 2) {
            const damage = Math.random() * this.dbUser!.strength + 1;
            return opponent.receiveDamage(damage);
        } else {
            return "Too far away to attack!";
        }
    }
    receiveDamage(damage: number) {
        if (this.dbUser!.defense > 0) {
            if (Math.random() > damage / this.dbUser!.defense) {
                return this.dbUser!.username + ": Blocked the attack!";
            }
        }
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        return (
            this.dbUser!.username +
            ": Received " +
            damage.toFixed(2) +
            " damage!"
        );
    }
}

//TODO list of active fights; Becaouse otherwise there is only one running.
export default class FightCommand extends Command {
    isActive: boolean = false;
    players: Fighter[] = [];
    arenaSize: number = 6;
    playerTurn: number = 1;
    override get info(): any {
        console.log("Fight called");

        return new SlashCommandBuilder()
            .setName("fight")
            .setDescription("fight a player")
            .addUserOption((option) =>
                option
                    .setName("opponent")
                    .setDescription("The opponent to fight")
                    .setRequired(true),
            )
            .toJSON();
    }

    validateTurn(id: string): boolean {
        if (this.playerTurn == 0 && id === this.players[0]?.dbUser!.id) {
            return true;
        } else if (this.playerTurn == 1 && id === this.players[1]?.dbUser!.id) {
            return true;
        }
        return false;
    }

    public override async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (
            interaction.user.id !== this.players[0]?.dbUser!.id &&
            interaction.user.id !== this.players[1]?.dbUser!.id
        ) {
            interaction.reply({
                content: "You are not part of this fight!",
                ephemeral: true,
            });
            return true;
        }
        if (this.isActive && this.validateTurn(interaction.user.id)) {
            const currentPlayer = this.players[this.playerTurn]!;
            const opponentPlayer = this.players[this.playerTurn === 0 ? 1 : 0]!;
            if (interaction.customId === "#moveLeft") {
                if (this.players[this.playerTurn]!.posX > 0) {
                    this.players[this.playerTurn]!.posX -= 1;
                    await interaction.update(
                        this.getFightDisplayOptions("Moved left"),
                    );
                }
            } else if (interaction.customId === "#moveRight") {
                if (this.players[this.playerTurn]!.posX < this.arenaSize - 1) {
                    this.players[this.playerTurn]!.posX += 1;
                    await interaction.update(
                        this.getFightDisplayOptions("Moved right"),
                    );
                }
            } else if (interaction.customId === "#attack") {
                const actionInfo: string = currentPlayer.attack(opponentPlayer);
                if (opponentPlayer.currentHealth <= 0) {
                    await interaction.update({
                        content: `The fight is over! ${currentPlayer.dbUser!.username} wins!`,
                        components: [],
                    });
                    this.isActive = false;
                    return true;
                }
                await interaction.update(
                    this.getFightDisplayOptions("Attacked\n" + actionInfo),
                );
            } else if (interaction.customId === "#flee") {
                if (currentPlayer.dbUser!.agility / 100 > Math.random()) {
                    await interaction.update({
                        content: `The fight is over! ${currentPlayer.dbUser!.username} escaped!`,
                        components: [],
                    });
                    this.isActive = false;
                    return true;
                } else {
                    await interaction.update(
                        this.getFightDisplayOptions("Failed to flee!"),
                    );
                }
            }
            if (this.playerTurn == 0) {
                this.playerTurn = 1;
            } else {
                this.playerTurn = 0;
            }
            return true;
        }
        if (
            interaction.customId === "#acceptFight" &&
            interaction.user.id === this.players[1]?.dbUser!.id
        ) {
            await interaction.update(
                this.getFightDisplayOptions("Accepted the fight"),
            );
            this.isActive = true;
            this.playerTurn = 0;
            return true;
        } else if (interaction.customId === "#declineFight") {
            await interaction.update({
                content: `The fight was cancelled by ${interaction.user.username}.`,
                components: [],
            });
            this.isActive = false;
            return true;
        } else if (interaction.customId === "#end") {
            await interaction.update({
                content: `The fight was ended by ${interaction.user.username}.`,
                components: [],
            });
            this.isActive = false;
        }
        return false;
    }

    createHealthBar(current: number, max: number, length: number = 10): string {
        if (max <= 0) return "[:red_square:]";
        const percentage = current / max;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        const filledBar = "█".repeat(filled);
        const emptyBar = " ".repeat(empty);
        // Using ANSI code block for better visual consistency of the bar
        return `\`\`\`ansi\n[2;31m${filledBar}[0m[2;37m${emptyBar}[0m\n\`\`\` ${current.toFixed(2)}/${max.toFixed(2)}`;
    }

    private getFightDisplayOptions(action: string) {
        let fieldArray: string[] = Array(this.arenaSize).fill("⬜");
        const currentPlayer = this.players[this.playerTurn]!;
        const nextPlayer = this.players[this.playerTurn === 0 ? 1 : 0]!;
        fieldArray[this.players[0]!.posX] = ":person_bald:";
        fieldArray[this.players[1]!.posX] = ":smirk_cat:";
        const player1HealthBar = this.createHealthBar(
            this.players[0]!.currentHealth,
            this.players[0]!.getMaxHealthStats(),
        );
        const player2HealthBar = this.createHealthBar(
            this.players[1]!.currentHealth,
            this.players[1]!.getMaxHealthStats(),
        );
        const builder = new EmbedBuilder()
            .setTitle(
                ":crossed_swords:" +
                    this.players[0]?.dbUser!.username +
                    " -VS- " +
                    this.players[1]?.dbUser!.username +
                    ":crossed_swords:",
            )
            .setDescription(
                currentPlayer.dbUser?.username +
                    ": " +
                    action +
                    "\nField:\n " +
                    fieldArray.join(""),
            )
            .addFields(
                // Player 1 Stats
                {
                    name: `${this.players[0]?.dbUser!.username}'s Status`,
                    value:
                        `❤️ Health: ${player1HealthBar}\n` +
                        `⚔️ Strength: **${this.players[0]?.dbUser!.strength}**\n` +
                        `🛡️ Defense: **${this.players[0]?.dbUser!.defense}**\n` +
                        `🏃 Agility: **${this.players[0]?.dbUser!.agility}** \n` +
                        `✨ Magicka: **${this.players[0]?.dbUser!.magicka}**\n` +
                        `🔋 Stamina: **${this.players[0]?.dbUser!.stamina}**\n` +
                        `🗣️ Charisma: **${this.players[0]?.dbUser!.charisma}**`,
                    inline: true,
                },
                // Player 2 Stats
                {
                    name: `${this.players[1]?.dbUser!.username}'s Status`,
                    value:
                        `❤️ Health: ${player2HealthBar}\n` +
                        `⚔️ Strength: **${this.players[1]?.dbUser!.strength}**\n` +
                        `🛡️ Defense: **${this.players[1]?.dbUser!.defense}**\n` +
                        `🏃 Agility: **${this.players[1]?.dbUser!.agility}**\n` +
                        `✨ Magicka: **${this.players[1]?.dbUser!.magicka}**\n` +
                        `🔋 Stamina: **${this.players[1]?.dbUser!.stamina}**\n` +
                        `🗣️ Charisma: **${this.players[1]?.dbUser!.charisma}**`,
                    inline: true,
                },
            )
            .setFooter({
                text: `➡️ It's ${nextPlayer.dbUser!.username}'s Turn!`,
                iconURL: nextPlayer.imgeUrl,
            })
            .setTimestamp();
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            nextPlayer.posX === 0
                ? new ButtonBuilder()
                      .setCustomId("#flee")
                      .setLabel("Flee")
                      .setStyle(ButtonStyle.Danger)
                : new ButtonBuilder()
                      .setCustomId("#moveLeft")
                      .setLabel("<<<")
                      .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("#attack")
                .setLabel("Attack")
                .setStyle(ButtonStyle.Primary),
            nextPlayer.posX === this.arenaSize - 1
                ? new ButtonBuilder()
                      .setCustomId("#flee")
                      .setLabel("Flee")
                      .setStyle(ButtonStyle.Danger)
                : new ButtonBuilder()
                      .setCustomId("#moveRight")
                      .setLabel(">>>")
                      .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("#end")
                .setLabel("End Fight (TEST)")
                .setStyle(ButtonStyle.Primary),
        );

        return {
            embeds: [builder],
            components: [actionRow],
        };
    }

    private InitiateFight() {
        const builder = new EmbedBuilder()
            .setTitle(
                ":crossed_swords:" +
                    this.players[0]?.dbUser!.username +
                    " -VS- " +
                    this.players[1]?.dbUser!.username +
                    ":crossed_swords:",
            )
            .setDescription(
                this.players[1]?.dbUser!.username + " do you accept the fight?",
            )
            .setTimestamp();
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("#acceptFight")
                .setLabel("Accept Fight")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("#declineFight")
                .setLabel("Decline Fight")
                .setStyle(ButtonStyle.Danger),
        );
        return {
            embeds: [builder],
            components: [actionRow],
        };
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        if (this.isActive) {
            interaction.reply({
                content: "A fight is already in progress!",
                ephemeral: true,
            });
            return;
        }
        const commandUser = interaction.user;
        const opponentUser =
            interaction.options.get("opponent")?.user || commandUser;
        if (commandUser === opponentUser) {
            interaction.reply({
                content: "You cannot fight yourself!",
                ephemeral: true,
            });
            return;
        }
        const dbCommandUser = await getUserFromId(commandUser.id);
        const dbOpponentUser = await getUserFromId(opponentUser.id);
        if (!dbCommandUser || !dbOpponentUser) {
            interaction.reply({
                content: "One of the users is not registered in the database.",
                ephemeral: true,
            });
            return;
        }
        this.playerTurn = 1;
        this.players[0] = new Fighter(
            dbCommandUser,
            0,
            commandUser.displayAvatarURL(),
        );
        this.players[1] = new Fighter(
            dbOpponentUser,
            this.arenaSize - 1,
            opponentUser.displayAvatarURL(),
        );

        let msg = this.InitiateFight();
        interaction.reply({
            embeds: msg.embeds,
            components: msg.components,
        });
    }
}
