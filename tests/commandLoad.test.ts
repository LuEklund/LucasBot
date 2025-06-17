import { test, expect, mock } from "bun:test";
import { Command } from "../src/commands";
import { client } from "../src/client";

test("load populates command map and registers", async () => {
    const create = mock(async () => ({}));
    // @ts-ignore - override application for test
    client.application = { commands: { create } } as any;

    await Command.load();

    expect(Command.commands.size).toBeGreaterThan(0);
    expect(create.mock.calls.length).toBe(Command.commands.size);
    expect(Command.commands.has("xp")).toBe(true);
});
