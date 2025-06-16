import { Command } from "@/commands";
import {
    CommandInteraction,
    InteractionResponse,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
} from "discord.js";

interface Globglogabgelab {
    url: string;
    option: string;
    desc?: string;
}

const songs: Globglogabgelab[] = [
    { url: "hLljd8pfiFg", option: "Official" },
    { url: "cIwRQwAS_YY", option: "Lil" },
    { url: "7C5zM8CnZF0", option: "XXX" },
    { url: "2vhQBN0xJJ8", option: "Havana" },
    { url: "47ZSI7nPAqo", option: "Stressed" },
    { url: "xnl0iddwELA", option: "Pumped up" },
    { url: "geWmx4YnRZA", option: "Gangnam style" },
    { url: "ZSAypaq7log", option: "Gods Plan" },
    { url: "a-QpDm0A3Ng", option: "Bad and Boujee" },
    { url: "lCS3y1qn4C8", option: "What is Love" },
    { url: "DVQsKYPm7mA", option: "Piano Man" },
    { url: "slogfEswemE", option: "I'm blue" },
    { url: "-pQnurfQZPI", option: "Believer" },
    { url: "wSXIblva5No", option: "Osaki" },
    { url: "OT4MyqrWo6E", option: "Darude - Sandstorm" },
    { url: "_OFN2Uztp34", option: "Schwabblestorm" },
    { url: "WMemX2uKUNI", option: "The Glob Man" },
    { url: "7XBjuDkXJ60", option: "Rap Glob" },
    { url: "uQASsDVChTQ", option: "Loves Books" },
    { url: "FSAibrRAUjM", option: "Glob On Me" },
    { url: "nV-ypF0L6Xs", option: "Ear Rape", desc: "EAR WARNING ⚠️" },
    { url: "TtqMwwfhErQ", option: "Globglogabgalab Busters" },
    { url: "CaWT1ayLyB0", option: "Chop Suey" },
    { url: "okZNjPP1VQ4", option: "PPAP" },
    { url: "-XBaIpW--T4", option: "wii" },
    { url: "uPmNlnGNEqw", option: "Tyrone" },
    { url: "e5WwKh5Nuqo", option: "Polkka" },
    { url: "G_hsLsKJmMM", option: "USA" },
    { url: "3pDdF4WC6mw", option: "The Fresh Prince" },
    { url: "NqAFlFE-b98", option: "In the house" },
    { url: "YHxhHz0tBqA", option: "Stronger" },
    { url: "oVk0NP02zLs", option: "Redbone" },
    { url: "oS0kaazgJTQ", option: "Tokyo Drift", desc: "🚗" },
    { url: "GfgFuytAWGw", option: "MF DOOM" },
    { url: "vwyOoX7VGTA", option: "Crab Rave" },
    { url: "A9cVvHv8j2o", option: "GTA San Andreas" },
    { url: "TO5xjH3wgpc", option: "Zeze" },
    { url: "bfBjUUWvaHg", option: "Thug" },
    { url: "LifQbgwfF5M", option: "x10000000 speed" },
    { url: "zUYJJ5wZulY", option: "But I'm blue" },
    { url: "M9V2l5KDMGY", option: "Amazon" },
    { url: "Hh-soLTb2uo", option: "Wrong Notes" },
    { url: "nmjHp_EkR9U", option: "360" },
    { url: "O5QAJQzeYas", option: "Minecraft" },
    { url: "dDTKAwikm94", option: "Ｇｌｏｂｇｌｏｇａｂｇｅｌａｂ" },
    { url: "9PT4UnsUvNw", option: "Africa" },
    { url: "rCm-R4nZM1s", option: "Likes To Party" },
    { url: "OvVWcb8KhPs", option: "All Star" },
    { url: "bUEBTr4cImY", option: "Wrong Singing" },
    { url: "89c4Y59z2rc", option: "Faster and faster" },
    { url: "lWO8TLqAwNU", option: "Drunk" },
    { url: "eHN3rbUWENI", option: "Vocoded" },
    { url: "CVWE9BPo0g0", option: "Swedish", desc: "🇸🇪" },
    { url: "0RxNKzLFxNY", option: "Polish", desc: "🇵🇱" },
    { url: "nxdTMhJa_rw", option: "Arabic", desc: "🇸🇦" },
    { url: "ostAWWuazsc", option: "bstchld", desc: "Sigma" },
    { url: "vel-CyHrvb4", option: "Strawinski" },
    { url: "yNOlOqLSAwk", option: "Walter" },
    { url: "y81WZvnHTt8", option: "The Creator", desc: "This man ruined Lucas's life" },
    { url: "YeemJlrNx2Q", option: "Mark", desc: "Secretly a globglogebgelab" },
    { url: "zISYDnXs5QI", option: "Globzilla" },
    { url: "U19kFq-zxzU", option: "GMod" },
    { url: "X5MUf95qzGI", option: "Freaky" },
    { url: "oxqCKsUiIWg", option: "Instrumental" },
    { url: "h6EuSlzO4m0", option: "Ends it all" },
    { url: "aTtnRjRJstc", option: "Spiderman" },
];

export default class GlobglogabgelabCommand extends Command.Base {
    // prettier-ignore
    public override main: Command.Command = new Command.Command("globglogabgelab", "The Globglogabgelab will sing you a banger from 2016", 
        [{
            name: "song", 
            description: "The song you want to play", 
            type: ApplicationCommandOptionType.Number, 
            autocomplete: true, 
        }], 
        this.onExecute, 
        this.onAutocomplete, 
    );

    public async onExecute(interaction: CommandInteraction): Promise<InteractionResponse<boolean>> {
        const song = interaction.options.get("song", false)?.value as number;
        const index = song ?? Math.floor(Math.random() * songs.length);

        return interaction.reply(
            `**${songs[index]?.option}** video *[here](https://www.youtube.com/watch?v=${songs[index]?.url})* ${songs[index]?.desc || "..."}`,
        );
    }

    public async onAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        console.log("ROOOOOOOOOOOOOOOOO");

        const rawInput = interaction.options.getFocused().toString();
        const focusedValue = rawInput.toLowerCase().replace(/[^a-z\s]/g, "");

        if (!focusedValue) {
            // Show 25 random songs when no input
            const shuffled = songs
                .map((song, index) => ({ name: song.option, value: index }))
                .sort(() => Math.random() - 0.5)
                .slice(0, 25);

            await interaction.respond(shuffled);
            return;
        }

        const searchWords = focusedValue.split(/\s+/).filter(Boolean);

        const filtered = songs
            .map((song, index) => ({
                name: song.option,
                value: index,
                cleanedName: song.option.toLowerCase().replace(/[^a-z\s]/g, ""),
            }))
            .filter((choice) => searchWords.every((word) => choice.cleanedName.includes(word)))
            .sort((a, b) => {
                const firstWord = searchWords[0] || "";
                const aIndex = a.cleanedName.indexOf(firstWord);
                const bIndex = b.cleanedName.indexOf(firstWord);
                return aIndex - bIndex;
            })
            .slice(0, 25)
            .map(({ name, value }) => ({ name, value })); // Clean up object for Discord

        await interaction.respond(filtered);
    }
}
