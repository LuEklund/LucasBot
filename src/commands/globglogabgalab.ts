import { Command } from "@/core/command";
import {
    SlashCommandBuilder,
    type Client,
    type ChatInputCommandInteraction,
} from "discord.js";

const songs: string[] = [
    "hLljd8pfiFg",
    "cIwRQwAS_YY",
    "7C5zM8CnZF0",
    "2vhQBN0xJJ8",
    "47ZSI7nPAqo",
    "xnl0iddwELA",
    "geWmx4YnRZA",
    "ZSAypaq7log",
    "a-QpDm0A3Ng",
    "lCS3y1qn4C8",
    "DVQsKYPm7mA",
    "slogfEswemE",
    "-pQnurfQZPI",
    "wSXIblva5No",
    "OT4MyqrWo6E",
    "_OFN2Uztp34",
    "WMemX2uKUNI",
    "7XBjuDkXJ60",
    "uQASsDVChTQ",
    "FSAibrRAUjM",
    "nV-ypF0L6Xs EAR WARNING ⚠️!",
    "TtqMwwfhErQ",
    "CaWT1ayLyB0",
    "okZNjPP1VQ4",
    "-XBaIpW--T4",
    "uPmNlnGNEqw",
    "e5WwKh5Nuqo",
    "G_hsLsKJmMM",
    "3pDdF4WC6mw",
    "NqAFlFE-b98",
    "YHxhHz0tBqA",
    "oVk0NP02zLs",
    "oS0kaazgJTQ",
    "GfgFuytAWGw",
    "vwyOoX7VGTA",
    "A9cVvHv8j2o",
    "TO5xjH3wgpc",
    "bfBjUUWvaHg",
    "LifQbgwfF5M",
    "zUYJJ5wZulY",
    "M9V2l5KDMGY",
    "Hh-soLTb2uo",
    "nmjHp_EkR9U",
    "O5QAJQzeYas",
    "dDTKAwikm94",
    "9PT4UnsUvNw",
    "rCm-R4nZM1s",
    "OvVWcb8KhPs",
    "bUEBTr4cImY",
    "89c4Y59z2rc",
    "eHN3rbUWENI",
    "CVWE9BPo0g0 🇸🇪",
    "lWO8TLqAwNU",
    "0RxNKzLFxNY 🇵🇱",
    "ostAWWuazsc",
    "vel-CyHrvb4",
    "yNOlOqLSAwk",
    "D-iX9mF6wcM",
    "y81WZvnHTt8 This man ruined Lucas's life",
    "YeemJlrNx2Q <-- Secretly a globglogebgelab",
    "zISYDnXs5QI",
    "U19kFq-zxzU",
    "X5MUf95qzGI",
    "oxqCKsUiIWg",
    "nxdTMhJa_rw 🇸🇦",
    "h6EuSlzO4m0",
    "aTtnRjRJstc",
];
export default class GlobglogabgalabCommand extends Command {
    override get info(): any {
        return new SlashCommandBuilder()
            .setName("globglogabgalab")
            .setDescription("Plays a random globglogabgalab song")
            .addNumberOption((option) =>
                option
                    .setName("index")
                    .setDescription("The index of a specific song")
                    .setRequired(false),
            )
            .toJSON();
    }

    override async executeCommand(
        client: Client,
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const max = songs.length - 1;
        const option = interaction.options.get("index", false)?.value as number;
        const index = option ?? Math.floor(Math.random() * (max + 1));
        const youtubeId = songs[index]?.slice(0, 11) || "";
        const comment = songs[index]?.slice(11) || "";

        let message: string;

        message =
            index <= max
                ? `**Index: ${index}/${max}** video *[here](https://www.youtube.com/watch?v=${youtubeId})* ${comment}`
                : `The max index is ${max}`;

        // Check for "Christmas"
        const today = new Date(2025, 5, 24); // Month is 0-based: 5 = June
        const isChristmas =
            (today.getDate() === 25 || today.getDate() === 24) &&
            today.getMonth() === 11;
        if (isChristmas)
            message =
                "🎄 Merry Christmas! video *[here](https://www.youtube.com/watch?v=52Li3SLj1gE)*";

        await interaction.reply(message);
    }
}
