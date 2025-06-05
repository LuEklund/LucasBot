import type {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    Interaction,
} from "discord.js";
import { Events } from "discord.js";
import { Quest } from "@/quest";
import type { Command } from "@/command";
import type { ILogger } from "@/services/botServices";

export class CommandService {
    private readonly commands = new Map<string, Command>();

    constructor(
        private readonly client: Client,
        private readonly logger: ILogger = console,
    ) {}

    async start(): Promise<void> {
        this.logger.info("Command Service starting.");
        await this.registerCommands();
        await Quest.loadQuests();
        this.client.on(Events.InteractionCreate, this.handleInteraction);
    }

    stop(): void {
        this.client.off(Events.InteractionCreate, this.handleInteraction);
        this.logger.info("Command Service stopped.");
    }

    private async registerCommands(): Promise<void> {
        const glob = new Bun.Glob("./src/commands/*.ts");

        for (const path of glob.scanSync(".")) {
            const { default: CommandClass } = await import(
                path.replace("./src/", "./")
            );
            const instance: Command = new CommandClass();
            const info = instance.info;
            this.commands.set(info.name, instance);
            await this.client.application?.commands.create(info);
            this.logger.info(`Registered command: ${info.name}`);
        }
    }

    private handleInteraction = async (
        interaction: Interaction,
    ): Promise<void> => {
        if (interaction.isChatInputCommand()) {
            await this.handleCommandInteraction(interaction);
        } else if (interaction.isAutocomplete()) {
            await this.handleAutocompleteInteraction(interaction);
        } else if (interaction.isButton()) {
            await this.handleButtonInteraction(interaction);
        }
    };

    private async handleCommandInteraction(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            await interaction.reply("Command not found.");
            return;
        }

        try {
            await command.executeCommand(this.client, interaction);
        } catch (err) {
            this.logger.error(
                err,
                `Error running command ${interaction.commandName}`,
            );
            await interaction.reply("Error executing command.");
        }
    }

    private async handleAutocompleteInteraction(
        interaction: AutocompleteInteraction,
    ): Promise<void> {
        const command = this.commands.get(interaction.commandName);
        if (!command) {
            await interaction.respond([]);
            return;
        }
        try {
            await command.executeAutoComplete(this.client, interaction);
        } catch (err) {
            this.logger.error(
                err,
                `Error running autocomplete for command ${interaction.commandName}`,
            );
            await interaction.respond([]);
        }
    }

    private async handleButtonInteraction(
        interaction: ButtonInteraction,
    ): Promise<void> {
        for (const quest of Quest.getQuests()) {
            try {
                if (await quest.onButtonInteract(this.client, interaction)) {
                    return;
                }
            } catch (err) {
                this.logger.error(
                    err,
                    `Error running button interaction for quest ${quest.fileName}`,
                );
            }
        }
        for (const [name, command] of this.commands) {
            try {
                if (await command.onButtonInteract(this.client, interaction)) {
                    return;
                }
            } catch (err) {
                this.logger.error(
                    err,
                    `Error running button interaction for command ${name}`,
                );
            }
        }
    }
}
