import { ButtonInteraction } from "discord.js";
import type { FightSession } from "@/services/fightSession";
import type { FightService } from "@/services/fightService";

export default async function decline(
    session: FightSession,
    interaction: ButtonInteraction,
    service: FightService,
): Promise<boolean> {
    await interaction.update({
        content: `The fight was cancelled by ${interaction.user.username}.`,
        components: [],
    });
    service.deleteFight(interaction.channelId);
    return true;
}
