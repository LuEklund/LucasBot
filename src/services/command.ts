import { Command } from "@/commands";
import { Service } from "@/service";
import { AutocompleteInteraction, Client, Events, type Interaction, MessageFlags } from "discord.js";

export default class CommandService extends Service.Base {
    override async start(client: Client): Promise<void> {
        client.on(Events.InteractionCreate, this.handleCommand);
    }

    override async stop(client: Client): Promise<void> {
        client.off(Events.InteractionCreate, this.handleCommand);
    }

    private handleCommand = async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const command = Command.commands.get(interaction.commandName);
            if (!command) {
                interaction.reply(`Command not found: '${interaction.commandName}'`);
                return;
            }

            const subName = (interaction.options as any).getSubcommand(false);
            if (!subName) await command.main.onExecute(interaction);
            else {
                for (const sub of command.subs) {
                    if (subName === sub.name) {
                        await sub.onExecute(interaction);
                        break;
                    }
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = Command.commands.get(interaction.commandName);
            if (!command) {
                console.error(`Autocomplete: Command not found: '${interaction.commandName}'`);
                return;
            }

            const subName = ((interaction as AutocompleteInteraction).options as any).getSubcommand(false);
            if (!subName) await command.main.onAutocomplete(interaction);
            else {
                for (const sub of command.subs) {
                    if (subName === sub.name) {
                        await sub.onAutocomplete(interaction);
                        break;
                    }
                }
            }
        }
    };
}
