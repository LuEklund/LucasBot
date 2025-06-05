import type {
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    CommandInteraction,
} from "discord.js";

export abstract class Command {
    abstract get info(): any;
    public async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        return false;
    }
    async executeAutoComplete(
        client: Client,
        interaction: AutocompleteInteraction,
    ): Promise<void> {
        interaction.respond([]);
    }
    abstract executeCommand(
        client: Client,
        interaction: CommandInteraction,
    ): Promise<void>;
}
