import { ButtonInteraction } from "discord.js";
import type { FightSession } from "@/services/fightSession";
import type { FightService } from "@/services/fightService";

export default async function endFight(
    session: FightSession,
    interaction: ButtonInteraction,
    service: FightService,
): Promise<boolean> {
    if (!(session.isActive && service.validateTurn(session, interaction.user.id))) {
        return false;
    }
    await interaction.update({
        content: `The fight was ended by ${interaction.user.username}.`,
        components: [],
    });
    service.deleteFight(interaction.channelId);
    return true;
}
