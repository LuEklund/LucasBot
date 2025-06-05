import { ButtonInteraction } from "discord.js";
import type { FightSession } from "@/services/fightSession";
import type { FightService } from "@/services/fightService";

export default async function moveRight(
    session: FightSession,
    interaction: ButtonInteraction,
    service: FightService,
): Promise<boolean> {
    if (
        !(
            session.isActive &&
            service.validateTurn(session, interaction.user.id)
        )
    ) {
        return false;
    }
    service.moveRight(session);
    await interaction.update(
        service.getFightDisplayOptions(session, "Moved right"),
    );
    return true;
}
