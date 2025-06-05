import { describe, expect, it, vi } from "bun:test";
import PingCommand from "../src/commands/ping";

describe("PingCommand", () => {
    it("has correct info", () => {
        const cmd = new PingCommand();
        const info = cmd.info;
        expect(info.name).toBe("ping");
        expect(info.description).toBe("test");
    });

    it("replies with message", async () => {
        const cmd = new PingCommand();
        const interaction: any = { reply: vi.fn() };
        await cmd.executeCommand({} as any, interaction);
        expect(interaction.reply).toHaveBeenCalledWith("Ping Works!");
    });
});
