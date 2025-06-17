import { test, expect, mock } from "bun:test";
import GlobCommand from "../src/commands/globglogabgelab";

function makeInteraction(value: string) {
    return {
        options: { getFocused: () => value, get: (_: string) => ({ value: 0 }) },
        reply: mock(async () => {}),
        respond: mock(async () => {}),
    } as any;
}

test("onExecute replies with song info", async () => {
    const cmd = new GlobCommand();
    const interaction = makeInteraction("");
    await cmd.onExecute({ ...interaction, options: { get: () => ({ value: 0 }) } });
    expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining("Official"));
});

test("onAutocomplete returns 25 when empty", async () => {
    const cmd = new GlobCommand();
    const interaction = makeInteraction("");
    await cmd.onAutocomplete(interaction);
    const arg = interaction.respond.mock.calls[0][0];
    expect(Array.isArray(arg)).toBe(true);
    expect(arg.length).toBe(25);
});

test("onAutocomplete filters songs", async () => {
    const cmd = new GlobCommand();
    const interaction = makeInteraction("official");
    await cmd.onAutocomplete(interaction);
    const arg = interaction.respond.mock.calls[0][0];
    expect(arg.some((o: any) => o.name === "Official" && o.value === 0)).toBe(true);
});
