import { describe, expect, it } from "bun:test";
import { EventEmitter } from "node:events";
import { TimeoutService } from "../src/services/timeoutService";

describe("TimeoutService", () => {
    it("registers and unregisters listeners", () => {
        const client = new EventEmitter();
        const service = new TimeoutService(client as any);
        service.start();
        expect(client.listenerCount("guildMemberUpdate")).toBe(1);
        service.stop();
        expect(client.listenerCount("guildMemberUpdate")).toBe(0);
    });
});
