import { describe, expect, it, vi } from "bun:test";
import { Command } from "../src/core/command";
import type { Client } from "discord.js";

class DummyCommand extends Command {
    get info() {
        return { name: "dummy" } as any;
    }
    async executeCommand(client: Client, interaction: any): Promise<void> {
        interaction.executed = true;
    }
}

describe("Command base", () => {
    it("provides default implementations", async () => {
        const cmd = new DummyCommand();
        const buttonResult = await cmd.onButtonInteract({} as any, {} as any);
        expect(buttonResult).toBe(false);
        const auto = { respond: vi.fn() } as any;
        await cmd.executeAutoComplete({} as any, auto);
        expect(auto.respond).toHaveBeenCalledWith([]);
    });
});
