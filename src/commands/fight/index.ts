import { Command } from "@/core/command";
import { getUserFromId } from "@/models/user";
import { Fighter } from "@/models/fighter";
import { FightController } from "@/controllers/fight/FightController";
import {
    ButtonInteraction,
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class FightCommand extends Command {
    private readonly controller = new FightController();

    override get info(): any {
        return new SlashCommandBuilder()
            .setName("fight")
            .setDescription("fight a player")
            .addUserOption((option) =>
                option
                    .setName("opponent")
                    .setDescription("The opponent to fight")
                    .setRequired(true),
            )
            .toJSON();
    }

    override async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        return this.controller.handleInteraction(interaction);
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const channelId = interaction.channelId;
        const service = this.controller.fightService;
        if (service.getSession(channelId)) {
            await interaction.reply({
                content: "A fight is already in progress in this channel!",
                ephemeral: true,
            });
            return;
        }

        const commandUser = interaction.user;
        const opponentUser = interaction.options.getUser("opponent", true);
        if (commandUser.id === opponentUser.id) {
            await interaction.reply({
                content: "You cannot fight yourself!",
                ephemeral: true,
            });
            return;
        }
        const dbCommandUser = await getUserFromId(commandUser.id);
        const dbOpponentUser = await getUserFromId(opponentUser.id);
        if (!dbCommandUser || !dbOpponentUser) {
            await interaction.reply({
                content: "One of the users is not registered in the database.",
                ephemeral: true,
            });
            return;
        }

        const fighter1 = new Fighter(
            dbCommandUser,
            0,
            commandUser.displayAvatarURL(),
        );
        const fighter2 = new Fighter(
            dbOpponentUser,
            service.getArenaSize() - 1,
            opponentUser.displayAvatarURL(),
        );

        const msg = this.controller.beginFight(channelId, fighter1, fighter2);
        await interaction.reply({
            embeds: msg.embeds,
            components: msg.components,
        });
    }
}
