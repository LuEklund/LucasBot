import { test, expect } from "bun:test";
import { client } from "../src/client";
import { GatewayIntentBits, Partials } from "discord.js";

test("client has required intents and partials", () => {
    const intents = client.options.intents;
    expect(intents.has(GatewayIntentBits.Guilds)).toBe(true);
    expect(intents.has(GatewayIntentBits.GuildMembers)).toBe(true);
    expect(intents.has(GatewayIntentBits.GuildMessages)).toBe(true);
    expect(intents.has(GatewayIntentBits.GuildMessageReactions)).toBe(true);
    expect(intents.has(GatewayIntentBits.MessageContent)).toBe(true);

    const partials = client.options.partials;
    expect(partials).toContain(Partials.Message);
    expect(partials).toContain(Partials.Reaction);
    expect(partials).toContain(Partials.User);
});
