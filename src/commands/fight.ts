import { Command } from "@/command";
import { getUserFromId } from "@/models/user";
import { Fighter } from "@/models/fighter";
import { FightService } from "@/services/fightService";
import type { FightSession } from "@/services/fightSession";
import {
    ButtonInteraction,
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class FightCommand extends Command {
    private readonly service = new FightService();

    private readonly handlers: Record<
        string,
        (session: FightSession, interaction: ButtonInteraction) => Promise<boolean>
    > = {
        '#moveLeft': async (s, i) => this.handleMoveLeft(s, i),
        '#moveRight': async (s, i) => this.handleMoveRight(s, i),
        '#attack': async (s, i) => this.handleAttack(s, i),
        '#flee': async (s, i) => this.handleFlee(s, i),
        '#end': async (s, i) => this.handleEnd(s, i),
        '#acceptFight': async (s, i) => this.handleAccept(s, i),
        '#declineFight': async (s, i) => this.handleDecline(s, i),
    };

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

    private sessionId(interaction: { channelId: string }): string {
        return interaction.channelId;
    }

    private isParticipant(session: FightSession, id: string): boolean {
        return (
            id === session.players[0].dbUser.id ||
            id === session.players[1].dbUser.id
        );
    }

    private isPlayersTurn(session: FightSession, id: string): boolean {
        return session.isActive && this.service.validateTurn(session, id);
    }

    public override async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
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
            return handler(session, interaction);
        }

        return false;
    }

    private async handleMoveLeft(
        session: FightSession,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (!this.isPlayersTurn(session, interaction.user.id)) {
            return false;
        }
        this.service.moveLeft(session);
        await interaction.update(
            this.service.getFightDisplayOptions(session, 'Moved left'),
        );
        return true;
    }

    private async handleMoveRight(
        session: FightSession,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (!this.isPlayersTurn(session, interaction.user.id)) {
            return false;
        }
        this.service.moveRight(session);
        await interaction.update(
            this.service.getFightDisplayOptions(session, 'Moved right'),
        );
        return true;
    }

    private async handleAttack(
        session: FightSession,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (!this.isPlayersTurn(session, interaction.user.id)) {
            return false;
        }
        const actionInfo = this.service.attack(session);
        if (
            session.players[0].currentHealth <= 0 ||
            session.players[1].currentHealth <= 0
        ) {
            await interaction.update({
                content: `The fight is over! ${interaction.user.username} wins!`,
                components: [],
            });
            this.service.deleteFight(this.sessionId(interaction));
            return true;
        }
        await interaction.update(
            this.service.getFightDisplayOptions(
                session,
                'Attacked\n' + actionInfo,
            ),
        );
        this.service.toggleTurn(session);
        return true;
    }

    private async handleFlee(
        session: FightSession,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (!this.isPlayersTurn(session, interaction.user.id)) {
            return false;
        }
        if (this.service.flee(session)) {
            await interaction.update({
                content: `The fight is over! ${interaction.user.username} escaped!`,
                components: [],
            });
            this.service.deleteFight(this.sessionId(interaction));
            return true;
        }
        await interaction.update(
            this.service.getFightDisplayOptions(session, 'Failed to flee!'),
        );
        this.service.toggleTurn(session);
        return true;
    }

    private async handleEnd(
        session: FightSession,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (!this.isPlayersTurn(session, interaction.user.id)) {
            return false;
        }
        await interaction.update({
            content: `The fight was ended by ${interaction.user.username}.`,
            components: [],
        });
        this.service.deleteFight(this.sessionId(interaction));
        return true;
    }

    private async handleAccept(
        session: FightSession,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        if (interaction.user.id !== session.players[1].dbUser.id) {
            return false;
        }
        this.service.startFight(this.sessionId(interaction));
        await interaction.update(
            this.service.getFightDisplayOptions(
                session,
                'Accepted the fight',
            ),
        );
        return true;
    }

    private async handleDecline(
        session: FightSession,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        await interaction.update({
            content: `The fight was cancelled by ${interaction.user.username}.`,
            components: [],
        });
        this.service.deleteFight(this.sessionId(interaction));
        return true;
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const channelId = interaction.channelId;
        if (this.service.getSession(channelId)) {
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
            this.service.getArenaSize() - 1,
            opponentUser.displayAvatarURL(),
        );

        this.service.createFight(channelId, fighter1, fighter2);
        const session = this.service.getSession(channelId)!;
        const msg = this.service.initiateFight(session);
        await interaction.reply({
            embeds: msg.embeds,
            components: msg.components,
        });
    }
}
