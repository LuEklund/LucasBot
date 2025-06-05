import { describe, expect, it } from "bun:test";
import { BotServices } from "../src/services/botServices";
import { Events } from "discord.js";
import { EventEmitter } from "node:events";

describe("BotServices", () => {
    it("starts and stops services", () => {
        const client = new EventEmitter();
        const service = new BotServices(client as any);
        service.start();
        expect(client.listenerCount(Events.MessageCreate)).toBe(1);
        expect(client.listenerCount(Events.GuildMemberUpdate)).toBe(1);
        service.stop();
        expect(client.listenerCount(Events.MessageCreate)).toBe(0);
        expect(client.listenerCount(Events.GuildMemberUpdate)).toBe(0);
    });
});
