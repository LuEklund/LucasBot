import { describe, expect, it } from "bun:test";
import { EventEmitter } from "node:events";
import { MessageResponderService } from "../src/services/messageResponderService";

const GOOD_USER_ID = "402859016457420820";

describe("MessageResponderService", () => {
    it("registers and unregisters listeners", () => {
        const client = new EventEmitter();
        const service = new MessageResponderService(client as any);
        service.start();
        expect(client.listenerCount("messageCreate")).toBe(1);
        service.stop();
        expect(client.listenerCount("messageCreate")).toBe(0);
    });

    it("reacts to specific users", async () => {
        const client = new EventEmitter();
        const reacted: string[] = [];
        const msg: any = {
            author: { id: GOOD_USER_ID, bot: false },
            react: async (emoji: string) => {
                reacted.push(emoji);
            },
        };
        const service = new MessageResponderService(client as any);
        await (service as any).handleMessage(msg);
        expect(reacted).toContain("👍");
    });
});
