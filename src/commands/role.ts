import { Command } from "@/command";
import {
    SlashCommandBuilder,
    User,
    InteractionContextType,
    GuildMember,
    Role,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

export default class XpCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("role")
            .setDescription("Role related stuff")
            .addSubcommand((sub) =>
                sub
                    .setName("give")
                    .setDescription("Gives a role to a user")
                    .addUserOption((opt) =>
                        opt
                            .setName("target")
                            .setDescription("User to give role to")
                            .setRequired(true),
                    )
                    .addRoleOption((opt) =>
                        opt
                            .setName("role")
                            .setDescription("The role you want to be given")
                            .setRequired(true),
                    ),
            )
            .addSubcommand((sub) =>
                sub
                    .setName("remove")
                    .setDescription("Remove a role of a user")
                    .addUserOption((opt) =>
                        opt
                            .setName("target")
                            .setDescription("User to remove role frome")
                            .setRequired(true),
                    )
                    .addRoleOption((opt) =>
                        opt
                            .setName("role")
                            .setDescription("The role you want to be removed")
                            .setRequired(true),
                    ),
            )
            .setDefaultMemberPermissions(0n)
            .setContexts(InteractionContextType.Guild)
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const sub = interaction.options.getSubcommand();
        const target =
            interaction.options.get("target")?.user || interaction.user;
        const role = interaction.options.getRole("role", true) as Role;

        if (!interaction.guild) {
            await interaction.reply({
                content: "This command can only be used in a guild.",
                ephemeral: true,
            });
            return;
        }

        const member = await interaction.guild.members.fetch(target.id);

        if (!role || !member) {
            await interaction.reply({
                content: "Invalid user or role.",
                ephemeral: true,
            });
            return;
        }

        switch (sub) {
            case "give": {
                if (
                    !interaction.memberPermissions?.has("Administrator") &&
                    !(
                        interaction.member instanceof GuildMember &&
                        interaction.member.roles.cache.has(
                            "1379498052431384687",
                        )
                    )
                )
                    break;

                try {
                    member.roles.add(role);
                    interaction.reply({
                        content: `${interaction.user} gave role ${role.toString()} to ${target}`,
                        ephemeral: true,
                    });
                } catch (err) {
                    console.error(err);
                    interaction.reply({
                        content: `${interaction.user} failed to add role ${role.toString()} from user ${target}`,
                        ephemeral: true,
                    });
                }

                break;
            }
            case "remove": {
                if (!interaction.memberPermissions?.has("Administrator")) break;

                try {
                    member.roles.remove(role);
                    interaction.reply({
                        content: `${interaction.user} removed role ${role.toString()} from ${target}`,
                        ephemeral: true,
                    });
                } catch (err) {
                    console.error(err);
                    interaction.reply({
                        content: `${interaction.user} failed to remove role ${role.toString()} from user ${target}`,
                        ephemeral: true,
                    });
                }

                break;
            }
            default:
                interaction.reply("You do not have permission to do this!");
        }
    }
}
