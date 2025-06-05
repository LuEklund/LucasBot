import { ButtonInteraction } from "discord.js";
import type { FightSession } from "@/services/fightSession";
import type { FightService } from "@/services/fightService";

export default async function flee(
    session: FightSession,
    interaction: ButtonInteraction,
    service: FightService,
): Promise<boolean> {
    if (!(session.isActive && service.validateTurn(session, interaction.user.id))) {
        return false;
    }
    if (service.flee(session)) {
        await interaction.update({
            content: `The fight is over! ${interaction.user.username} escaped!`,
            components: [],
        });
        service.deleteFight(interaction.channelId);
        return true;
    }
    await interaction.update(
        service.getFightDisplayOptions(session, "Failed to flee!"),
    );
    service.toggleTurn(session);
    return true;
}
