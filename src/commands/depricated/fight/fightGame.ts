import Fighter from "./fighter";
import type { User as DiscordUser } from "discord.js";
import { BLOCK_SIZE } from "./fieldGenerate";
import { AppUser } from "@/user";
interface GameInitializationResult {
    success: boolean;
    reason: string;
}

export default class FightGame {
    isActive: boolean = false;
    players: Fighter[] = [];
    arenaSize: number = 6;
    playerTurn: number = 1;
    discordUsers: DiscordUser[] = [];
    bet: number = 0;

    private static nextId: number = 0;
    id: number = 0;

    constructor(
        discordUser1: DiscordUser,
        discordUser2: DiscordUser,
        amount: number,
    ) {
        this.id = FightGame.nextId++;
        this.bet = amount;
        this.discordUsers = [discordUser1, discordUser2];
    }

    async initGame(id: string): Promise<GameInitializationResult> {
        if (id !== this.discordUsers[1]!.id)
            return { success: false, reason: "You are not the second player!" };

        const appUser1 = await AppUser.fromID(this.discordUsers[0]!.id);
        const appUser2 = await AppUser.fromID(this.discordUsers[1]!.id);
        const dbCommandUser = appUser1.database;
        const dbOpponentUser = appUser2.database;
        if (!dbCommandUser || !dbOpponentUser) {
            return {
                success: false,
                reason: "One or both users could not be found in the database.",
            };
        }
        if (
            dbCommandUser.inventory.gold < this.bet ||
            dbOpponentUser.inventory.gold < this.bet
        ) {
            return {
                success: false,
                reason: "One or both users could not afford the bet",
            };
        }
        await appUser1.addGold(-this.bet).save();
        await appUser2.addGold(-this.bet).save();

        this.players[0] = await Fighter.create(
            dbCommandUser,
            0,
            this.discordUsers[0]!.displayAvatarURL({
                extension: "png",
                size: BLOCK_SIZE,
            }),
        );
        this.players[1] = await Fighter.create(
            dbOpponentUser,
            this.arenaSize - 1,
            this.discordUsers[1]!.displayAvatarURL({
                extension: "png",
                size: BLOCK_SIZE,
            }),
        );
        this.isActive = true;
        return {
            success: true,
            reason: " Accepted the fight",
        };
    }

    validateTurn(id: string): boolean {
        if (this.playerTurn == 0 && id === this.players[0]?.dbUser!.id) {
            return true;
        } else if (this.playerTurn == 1 && id === this.players[1]?.dbUser!.id) {
            return true;
        }
        return false;
    }

    getPlayers(): Fighter[] {
        return this.players;
    }
    getDiscordUserById(id: string): DiscordUser | undefined {
        return this.discordUsers.find((player) => player.id === id);
    }
    isValidCombatMovement(playerId: string): boolean {
        return this.isActive && this.validateTurn(playerId);
    }
    getCurrentPlayer(): Fighter {
        return this.players[this.playerTurn]!;
    }
    getNextPlayer(): Fighter {
        return this.players[this.playerTurn === 0 ? 1 : 0]!;
    }
    movePlayer(direction: "left" | "right") {
        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.drainMana(1);
        if (direction === "left") {
            currentPlayer.posX = Math.max(0, currentPlayer.posX - 1);
        } else if (direction === "right") {
            currentPlayer.posX = Math.min(
                this.arenaSize - 1,
                currentPlayer.posX + 1,
            );
        }
    }
    playerAttack(): string {
        const currentPlayer = this.getCurrentPlayer();
        const opponent = this.getNextPlayer();
        currentPlayer.drainMana(1);
        const actionInfo: string = currentPlayer.attack(opponent);
        if (opponent.currentHealth <= 0) {
            return `** ${opponent.dbUser!.username} has been defeated!** \n${currentPlayer.dbUser!.username} got rewarded: :moneybag:**${this.bet * 2}** `;
        }
        return actionInfo;
    }
    playerFlee(): boolean {
        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.drainMana(1);
        return currentPlayer.fighterStats.agility / 100 > Math.random();
    }

    playerSleep(): string {
        const currentPlayer = this.getCurrentPlayer();
        const healthToGain =
            Math.random() * (currentPlayer.fighterStats.vitality || 1);
        const manaToGain =
            (Math.random() * (currentPlayer.fighterStats.stamina || 1)) / 3 + 1;
        currentPlayer.gainHealth(healthToGain);
        currentPlayer.gainMana(manaToGain);
        return `rested and regained ${healthToGain.toFixed(2)} health and ${manaToGain.toFixed(2)} mana.`;
    }

    nextTurn() {
        this.playerTurn = this.playerTurn === 0 ? 1 : 0;
        this.getCurrentPlayer().calculateStats();
        this.getNextPlayer().calculateStats();
    }

    async gameOver(wasCompleted: boolean = false) {
        const winnerReward = this.bet * 2;
        const user1 = await AppUser.fromID(this.discordUsers[0]!.id);
        const user2 = await AppUser.fromID(this.discordUsers[1]!.id);
        if (this.players[0]!.currentHealth <= 0) {
            await user2.addGold(winnerReward).save();
        } else if (this.players[1]!.currentHealth <= 0) {
            await user1.addGold(winnerReward).save();
        } else {
            await user2.addGold(this.bet).save();
            await user1.addGold(this.bet).save();
        }
        if (wasCompleted) {
            await user2.addXP(10).save();
            await user1.addXP(10).save();
        }
    }
}
