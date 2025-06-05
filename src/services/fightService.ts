import { Fighter } from "@/models/fighter";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";

export interface FightSession {
    players: [Fighter, Fighter];
    isActive: boolean;
    arenaSize: number;
    playerTurn: 0 | 1;
}

export class FightService {
    private readonly sessions = new Map<string, FightSession>();

    constructor(private readonly arenaSize = 6) {}

    getArenaSize(): number {
        return this.arenaSize;
    }

    createFight(channelId: string, p1: Fighter, p2: Fighter): void {
        this.sessions.set(channelId, {
            players: [p1, p2],
            isActive: false,
            arenaSize: this.arenaSize,
            playerTurn: 1,
        });
    }

    getSession(channelId: string): FightSession | undefined {
        return this.sessions.get(channelId);
    }

    deleteFight(channelId: string): void {
        this.sessions.delete(channelId);
    }

    startFight(channelId: string): void {
        const session = this.sessions.get(channelId);
        if (session) {
            session.isActive = true;
            session.playerTurn = 0;
        }
    }

    validateTurn(session: FightSession, id: string): boolean {
        if (session.playerTurn === 0 && id === session.players[0].dbUser.id) {
            return true;
        }
        if (session.playerTurn === 1 && id === session.players[1].dbUser.id) {
            return true;
        }
        return false;
    }

    moveLeft(session: FightSession): void {
        if (session.players[session.playerTurn].posX > 0) {
            session.players[session.playerTurn].posX -= 1;
        }
    }

    moveRight(session: FightSession): void {
        if (session.players[session.playerTurn].posX < session.arenaSize - 1) {
            session.players[session.playerTurn].posX += 1;
        }
    }

    attack(session: FightSession): string {
        const current = session.players[session.playerTurn];
        const opponent = session.players[session.playerTurn === 0 ? 1 : 0];
        return current.attack(opponent);
    }

    flee(session: FightSession): boolean {
        const current = session.players[session.playerTurn];
        return current.dbUser.agility / 100 > Math.random();
    }

    toggleTurn(session: FightSession): void {
        session.playerTurn = session.playerTurn === 0 ? 1 : 0;
    }

    createHealthBar(current: number, max: number, length = 10): string {
        if (max <= 0) return "[:red_square:]";
        const percentage = current / max;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        const filledBar = "█".repeat(filled);
        const emptyBar = " ".repeat(empty);
        return `\`\`\`ansi\n${filledBar}${emptyBar}\n\`\`\` ${current.toFixed(2)}/${max.toFixed(2)}`;
    }

    getFightDisplayOptions(
        session: FightSession,
        action: string,
    ): {
        embeds: EmbedBuilder[];
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        const fieldArray: string[] = Array(session.arenaSize).fill("⬜");
        const currentPlayer = session.players[session.playerTurn];
        const nextPlayer = session.players[session.playerTurn === 0 ? 1 : 0];
        fieldArray[session.players[0].posX] = ":person_bald:";
        fieldArray[session.players[1].posX] = ":smirk_cat:";
        const player1HealthBar = this.createHealthBar(
            session.players[0].currentHealth,
            session.players[0].getMaxHealthStats(),
        );
        const player2HealthBar = this.createHealthBar(
            session.players[1].currentHealth,
            session.players[1].getMaxHealthStats(),
        );
        const builder = new EmbedBuilder()
            .setTitle(
                ":crossed_swords:" +
                    session.players[0].dbUser.username +
                    " -VS- " +
                    session.players[1].dbUser.username +
                    ":crossed_swords:",
            )
            .setDescription(
                currentPlayer.dbUser.username +
                    ": " +
                    action +
                    "\nField:\n " +
                    fieldArray.join(""),
            )
            .addFields(
                {
                    name: `${session.players[0].dbUser.username}'s Status`,
                    value:
                        `❤️ Health: ${player1HealthBar}\n` +
                        `⚔️ Strength: **${session.players[0].dbUser.strength}**\n` +
                        `🛡️ Defense: **${session.players[0].dbUser.defense}**\n` +
                        `🏃 Agility: **${session.players[0].dbUser.agility}** \n` +
                        `✨ Magicka: **${session.players[0].dbUser.magicka}**\n` +
                        `🔋 Stamina: **${session.players[0].dbUser.stamina}**\n` +
                        `🗣️ Charisma: **${session.players[0].dbUser.charisma}**`,
                    inline: true,
                },
                {
                    name: `${session.players[1].dbUser.username}'s Status`,
                    value:
                        `❤️ Health: ${player2HealthBar}\n` +
                        `⚔️ Strength: **${session.players[1].dbUser.strength}**\n` +
                        `🛡️ Defense: **${session.players[1].dbUser.defense}**\n` +
                        `🏃 Agility: **${session.players[1].dbUser.agility}**\n` +
                        `✨ Magicka: **${session.players[1].dbUser.magicka}**\n` +
                        `🔋 Stamina: **${session.players[1].dbUser.stamina}**\n` +
                        `🗣️ Charisma: **${session.players[1].dbUser.charisma}**`,
                    inline: true,
                },
            )
            .setFooter({
                text: `➡️ It's ${nextPlayer.dbUser.username}'s Turn!`,
                iconURL: nextPlayer.imageUrl,
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
            nextPlayer.posX === session.arenaSize - 1
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

    initiateFight(session: FightSession): {
        embeds: EmbedBuilder[];
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        const builder = new EmbedBuilder()
            .setTitle(
                ":crossed_swords:" +
                    session.players[0].dbUser.username +
                    " -VS- " +
                    session.players[1].dbUser.username +
                    ":crossed_swords:",
            )
            .setDescription(
                session.players[1].dbUser.username +
                    " do you accept the fight?",
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
}
