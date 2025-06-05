import { ButtonInteraction } from "discord.js";
import type { FightSession } from "@/services/fightSession";
import { FightService } from "@/services/fightService";
import accept from "./handlers/accept";
import attack from "./handlers/attack";
import decline from "./handlers/decline";
import endFight from "./handlers/end";
import flee from "./handlers/flee";
import moveLeft from "./handlers/moveLeft";
import moveRight from "./handlers/moveRight";
import type { Fighter } from "@/models/fighter";

export class FightController {
    private readonly service = new FightService();

    private readonly handlers: Record<
        string,
        (
            session: FightSession,
            interaction: ButtonInteraction,
            service: FightService,
        ) => Promise<boolean>
    > = {
        "#moveLeft": moveLeft,
        "#moveRight": moveRight,
        "#attack": attack,
        "#flee": flee,
        "#end": endFight,
        "#acceptFight": accept,
        "#declineFight": decline,
    };

    get fightService(): FightService {
        return this.service;
    }

    private sessionId(interaction: { channelId: string }): string {
        return interaction.channelId;
    }

    private isParticipant(session: FightSession, id: string): boolean {
        return (
            id === session.players[0].dbUser.id ||
            id === session.players[1].dbUser.id
        );
    }

    async handleInteraction(interaction: ButtonInteraction): Promise<boolean> {
        const session = this.service.getSession(this.sessionId(interaction));
        if (!session) {
            return false;
        }

        if (!this.isParticipant(session, interaction.user.id)) {
            await interaction.reply({
                content: "You are not part of this fight!",
                ephemeral: true,
            });
            return true;
        }

        const handler = this.handlers[interaction.customId];
        if (handler) {
            return handler(session, interaction, this.service);
        }

        return false;
    }

    beginFight(channelId: string, p1: Fighter, p2: Fighter) {
        this.service.createFight(channelId, p1, p2);
        const session = this.service.getSession(channelId)!;
        return this.service.initiateFight(session);
    }
}
