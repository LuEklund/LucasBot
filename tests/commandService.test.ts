import { describe, expect, it, vi } from "bun:test";
import { CommandService } from "../src/services/commandService";
import { Quest } from "../src/core/quest";
import { Events } from "discord.js";
import { EventEmitter } from "node:events";

describe("CommandService", () => {
    it("registers and unregisters interaction listener", async () => {
        const client = new EventEmitter();
        const service = new CommandService(client as any);
        // stub private methods
        (service as any).registerCommands = vi
            .fn()
            .mockResolvedValue(undefined);
        const questSpy = vi
            .spyOn(Quest, "loadQuests")
            .mockResolvedValue(undefined as any);
        await service.start();
        expect(client.listenerCount(Events.InteractionCreate)).toBe(1);
        service.stop();
        expect(client.listenerCount(Events.InteractionCreate)).toBe(0);
        questSpy.mockRestore();
    });
});
