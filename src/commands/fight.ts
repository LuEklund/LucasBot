import { Command } from "@/command";
import { getUserFromId } from "@/models/user";
import { Fighter } from "@/models/fighter";
import { FightService } from "@/services/fightService";
import {
    ButtonInteraction,
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class FightCommand extends Command {
    private readonly service = new FightService();

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

    public override async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        const session = this.service.getSession(this.sessionId(interaction));
        if (!session) {
            return false;
        }

        if (
            interaction.user.id !== session.players[0].dbUser.id &&
            interaction.user.id !== session.players[1].dbUser.id
        ) {
            await interaction.reply({
                content: "You are not part of this fight!",
                ephemeral: true,
            });
            return true;
        }

        if (
            session.isActive &&
            this.service.validateTurn(session, interaction.user.id)
        ) {
            if (interaction.customId === "#moveLeft") {
                this.service.moveLeft(session);
                await interaction.update(
                    this.service.getFightDisplayOptions(session, "Moved left"),
                );
            } else if (interaction.customId === "#moveRight") {
                this.service.moveRight(session);
                await interaction.update(
                    this.service.getFightDisplayOptions(session, "Moved right"),
                );
            } else if (interaction.customId === "#attack") {
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
                        "Attacked\n" + actionInfo,
                    ),
                );
                this.service.toggleTurn(session);
            } else if (interaction.customId === "#flee") {
                if (this.service.flee(session)) {
                    await interaction.update({
                        content: `The fight is over! ${interaction.user.username} escaped!`,
                        components: [],
                    });
                    this.service.deleteFight(this.sessionId(interaction));
                    return true;
                } else {
                    await interaction.update(
                        this.service.getFightDisplayOptions(
                            session,
                            "Failed to flee!",
                        ),
                    );
                    this.service.toggleTurn(session);
                }
            } else if (interaction.customId === "#end") {
                await interaction.update({
                    content: `The fight was ended by ${interaction.user.username}.`,
                    components: [],
                });
                this.service.deleteFight(this.sessionId(interaction));
                return true;
            }
            return true;
        }

        if (
            interaction.customId === "#acceptFight" &&
            interaction.user.id === session.players[1].dbUser.id
        ) {
            this.service.startFight(this.sessionId(interaction));
            await interaction.update(
                this.service.getFightDisplayOptions(
                    session,
                    "Accepted the fight",
                ),
            );
            return true;
        } else if (interaction.customId === "#declineFight") {
            await interaction.update({
                content: `The fight was cancelled by ${interaction.user.username}.`,
                components: [],
            });
            this.service.deleteFight(this.sessionId(interaction));
            return true;
        }
        return false;
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
