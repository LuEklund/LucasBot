import { ButtonInteraction } from "discord.js";
import type { FightSession } from "@/services/fightSession";
import type { FightService } from "@/services/fightService";

export default async function attack(
    session: FightSession,
    interaction: ButtonInteraction,
    service: FightService,
): Promise<boolean> {
    if (!(session.isActive && service.validateTurn(session, interaction.user.id))) {
        return false;
    }
    const actionInfo = service.attack(session);
    if (
        session.players[0].currentHealth <= 0 ||
        session.players[1].currentHealth <= 0
    ) {
        await interaction.update({
            content: `The fight is over! ${interaction.user.username} wins!`,
            components: [],
        });
        service.deleteFight(interaction.channelId);
        return true;
    }
    await interaction.update(
        service.getFightDisplayOptions(session, "Attacked\n" + actionInfo),
    );
    service.toggleTurn(session);
    return true;
}
