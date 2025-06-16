import {
    SlashCommandBuilder,
    InteractionResponse,
    AutocompleteInteraction,
    CommandInteraction,
    SlashCommandSubcommandBuilder,
    ApplicationCommandOptionType,
} from "discord.js";
import { client } from ".";

export namespace Command {
    export abstract class Base {
        public abstract main: Command;
        public subs: Command[] = [];

        public get slash(): SlashCommandBuilder {
            const builder = new SlashCommandBuilder().setName(this.main.name).setDescription(this.main.description);

            if (this.main.options && this.main.options.length > 0)
                applyOptionsToDiscordBuilder(builder, this.main.options);

            this.subs.forEach((subCommand) => {
                const subBuilder = new SlashCommandSubcommandBuilder()
                    .setName(subCommand.name)
                    .setDescription(subCommand.description);

                if (subCommand.options && subCommand.options.length > 0)
                    applyOptionsToDiscordBuilder(subBuilder, subCommand.options);

                builder.addSubcommand(subBuilder);
            });

            return builder;
        }

        get class(): new (...args: any[]) => this {
            return this.constructor as new (...args: any[]) => this;
        }
    }

    export class Command {
        name: string;
        description: string;
        options: Option[];
        onExecute: (interaction: CommandInteraction) => Promise<InteractionResponse<boolean>>;
        onAutocomplete: (interaction: AutocompleteInteraction) => Promise<void>;

        constructor(
            name: string,
            description: string,
            options: Option[],
            onExecute: (interaction: CommandInteraction) => Promise<InteractionResponse<boolean>> = (
                interaction: CommandInteraction,
            ) => {
                return interaction.reply("");
            },

            onAutocomplete: (interaction: AutocompleteInteraction) => Promise<void> = (
                interaction: AutocompleteInteraction,
            ) => {
                return interaction.respond([]);
            },
        ) {
            this.name = name;
            this.description = description;
            this.options = options;
            this.onExecute = onExecute;
            this.onAutocomplete = onAutocomplete;
        }
    }

    // prettier-ignore
    export type Option = {
        name: string;
        description: string;
        required?: boolean;
        autocomplete?: boolean;
    } & (
        | { type: ApplicationCommandOptionType.String; choices?: { name: string; value: string }[]; min_length?: number; max_length?: number; }
        | { type: ApplicationCommandOptionType.Integer; choices?: { name: string; value: number }[]; min_value?: number; max_value?: number; }
        | { type: ApplicationCommandOptionType.Number; choices?: { name: string; value: number }[]; min_value?: number; max_value?: number; }
        | { type: ApplicationCommandOptionType.Boolean }
        | { type: ApplicationCommandOptionType.User }
        | { type: ApplicationCommandOptionType.Role }
        | { type: ApplicationCommandOptionType.Mentionable }
        | { type: ApplicationCommandOptionType.Attachment }
    );

    export const commands: Map<string, Base> = new Map();

    export async function load() {
        const glob = new Bun.Glob("src/commands/*.ts");
        console.log(`Loaded commands:`);

        for (const path of glob.scanSync(".")) {
            const { default: CommandClass } = await import(path.replace("src/commands/", "./commands/"));
            const command: Base = new CommandClass();

            const name = path
                .split("/")
                .pop()
                ?.replace(".ts", "")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .toLowerCase()!;

            console.log(`\t${name}`);
            commands.set(name, command);

            client.application?.commands.create(command.slash.toJSON());
        }
    }

    function applyOptionsToDiscordBuilder<T extends SlashCommandBuilder | SlashCommandSubcommandBuilder>(
        builder: T,
        options: Option[],
    ): T {
        for (const option of options) {
            switch (option.type) {
                case ApplicationCommandOptionType.String:
                    builder.addStringOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        if (option.autocomplete !== undefined) opt.setAutocomplete(option.autocomplete);

                        if (
                            "choices" in option &&
                            option.choices &&
                            option.type === ApplicationCommandOptionType.String
                        ) {
                            opt.addChoices(...option.choices);
                        }
                        if ("min_length" in option && option.min_length !== undefined)
                            opt.setMinLength(option.min_length);
                        if ("max_length" in option && option.max_length !== undefined)
                            opt.setMaxLength(option.max_length);
                        return opt;
                    });
                    break;
                case ApplicationCommandOptionType.Integer:
                    builder.addIntegerOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        if (option.autocomplete !== undefined) opt.setAutocomplete(option.autocomplete);

                        if (
                            "choices" in option &&
                            option.choices &&
                            option.type === ApplicationCommandOptionType.Integer
                        ) {
                            opt.addChoices(...option.choices);
                        }
                        if ("min_value" in option && option.min_value !== undefined) opt.setMinValue(option.min_value);
                        if ("max_value" in option && option.max_value !== undefined) opt.setMaxValue(option.max_value);
                        return opt;
                    });
                    break;
                case ApplicationCommandOptionType.Number:
                    builder.addNumberOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        if (option.autocomplete !== undefined) opt.setAutocomplete(option.autocomplete);

                        if (
                            "choices" in option &&
                            option.choices &&
                            option.type === ApplicationCommandOptionType.Number
                        ) {
                            opt.addChoices(...option.choices);
                        }
                        if ("min_value" in option && option.min_value !== undefined) opt.setMinValue(option.min_value);
                        if ("max_value" in option && option.max_value !== undefined) opt.setMaxValue(option.max_value);
                        return opt;
                    });
                    break;
                case ApplicationCommandOptionType.Boolean:
                    builder.addBooleanOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        return opt;
                    });
                    break;
                case ApplicationCommandOptionType.User:
                    builder.addUserOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        return opt;
                    });
                    break;
                case ApplicationCommandOptionType.Role:
                    builder.addRoleOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        return opt;
                    });
                    break;
                case ApplicationCommandOptionType.Mentionable:
                    builder.addMentionableOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        return opt;
                    });
                    break;
                case ApplicationCommandOptionType.Attachment:
                    builder.addAttachmentOption((opt) => {
                        opt.setName(option.name).setDescription(option.description);
                        if (option.required !== undefined) opt.setRequired(option.required);
                        return opt;
                    });
                    break;
            }
        }
        return builder;
    }
}
