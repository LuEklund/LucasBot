export namespace Globals {
    export const ATTRIBUTES = {
        strength: {
            name: "Strength",
            value: "strength",
            emoji: "💪",
        },
        defense: {
            name: "Defense",
            value: "defense",
            emoji: "🛡️",
        },
        agility: {
            name: "Agility",
            value: "Agility",
            emoji: "💨",
        },
        magicka: {
            name: "Magicka",
            value: "magicka",
            emoji: "🔮",
        },
        vitality: {
            name: "Vitality",
            value: "vitality",
            emoji: "❤️",
        },
        stamina: {
            name: "Stamina",
            value: "stamina",
            emoji: "🔋",
        },
        charisma: {
            name: "Charisma",
            value: "charisma",
            emoji: "🔥",
        },
        gold: {
            name: "Charisma",
            value: "charisma",
            emoji: "💰",
        },
        xp: {
            name: "Charisma",
            value: "charisma",
            emoji: "🌟",
        },
        skillpoint: {
            name: "Charisma",
            value: "charisma",
            emoji: ":bulb:",
        },
        items: {
            name: "Charisma",
            value: "charisma",
            emoji: "📦",
        },
        level: {
            name: "Charisma",
            value: "charisma",
            emoji: ":arrow_up:",
        },
    };

    export const LINK: string = "https://www.youtube.com/@LucasDevelop";
    export let CHANNEL: import("discord.js").TextChannel;

    export function random(max: number, min: number = 0): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
