import { ButtonInteraction } from "discord.js";
import type { FightSession } from "@/services/fightSession";
import type { FightService } from "@/services/fightService";

export default async function accept(
    session: FightSession,
    interaction: ButtonInteraction,
    service: FightService,
): Promise<boolean> {
    if (interaction.user.id !== session.players[1].dbUser.id) {
        return false;
    }
    service.startFight(interaction.channelId);
    await interaction.update(
        service.getFightDisplayOptions(session, "Accepted the fight"),
    );
    return true;
}
