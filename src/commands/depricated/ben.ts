import { Command } from "@/command";
import { SlashCommandBuilder, type Client, type CommandInteraction, type RestOrArray } from "discord.js";

export default class BenCommand extends Command.Base {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("ben")
            .setDescription("Make Ben respond to the haters")
            .addStringOption((option) =>
                option
                    .setName("option")
                    .setDescription("The thing you want Ben to say to the haters")
                    .setRequired(true)
                    .setChoices(
                        { name: "Yes", value: "yes" },
                        { name: "No", value: "no" },
                        { name: "Huhuhu", value: "huhuhu" },
                        { name: "Bean", value: "bean" },
                        { name: "Ben", value: "ben" },
                        { name: "Russian", value: "russian" },
                        { name: "Cought", value: "cought" },
                    ),
            )
            .toJSON();
    }

    override async executeCommand(client: Client, interaction: CommandInteraction): Promise<void> {
        const option = interaction.options.get("option")?.value as string;

        const videoMap: Record<string, string> = {
            yes: "QcWOFbXAVBY",
            no: "XqRgACTk7QI",
            huhuhu: "HQFIaj1Ko4A&s=4",
            bean: "lgI93MzC3ZU",
            ben: "On-TQRl6ULs",
            russian: "dlMT9rh4jMc",
            cought: "z6ee9ZHCTt4",
        };

        const video = videoMap[option] ?? "Invalid";

        interaction.reply(`${option} *[...](https://www.youtube.com/watch?v=${video})*`);
    }
}
