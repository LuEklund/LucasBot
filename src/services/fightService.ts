import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { Fighter } from "@/models/fighter";
import { FightSession } from "./fightSession";
import { FightRenderer } from "./fightRenderer";

export class FightService {
    private readonly sessions = new Map<string, FightSession>();
    private readonly renderer = new FightRenderer();

    constructor(private readonly arenaSize = 6) {}

    getArenaSize(): number {
        return this.arenaSize;
    }

    createFight(channelId: string, p1: Fighter, p2: Fighter): void {
        const session = new FightSession([p1, p2], this.arenaSize);
        this.sessions.set(channelId, session);
    }

    getSession(channelId: string): FightSession | undefined {
        return this.sessions.get(channelId);
    }

    deleteFight(channelId: string): void {
        this.sessions.delete(channelId);
    }

    startFight(channelId: string): void {
        const session = this.sessions.get(channelId);
        session?.start();
    }

    validateTurn(session: FightSession, id: string): boolean {
        return session.validateTurn(id);
    }

    moveLeft(session: FightSession): void {
        session.moveLeft();
    }

    moveRight(session: FightSession): void {
        session.moveRight();
    }

    attack(session: FightSession): string {
        return session.attack();
    }

    flee(session: FightSession): boolean {
        return session.flee();
    }

    toggleTurn(session: FightSession): void {
        session.toggleTurn();
    }

    createHealthBar(current: number, max: number, length = 10): string {
        return this.renderer.createHealthBar(current, max, length);
    }

    getFightDisplayOptions(
        session: FightSession,
        action: string,
    ): {
        embeds: EmbedBuilder[];
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        return this.renderer.getFightDisplayOptions(session, action);
    }

    initiateFight(session: FightSession): {
        embeds: EmbedBuilder[];
        components: ActionRowBuilder<ButtonBuilder>[];
    } {
        return this.renderer.initiateFight(session);
    }
}
