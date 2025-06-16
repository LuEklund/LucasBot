import { test, expect, mock } from "bun:test";
import { AppButton } from "../src/button";
import { ButtonStyle } from "discord.js";

test("createActionRow splits buttons", () => {
    const b1 = new AppButton("A", mock(() => {}), ButtonStyle.Primary);
    const b2 = new AppButton("B", mock(() => {}), ButtonStyle.Primary);
    const rows = AppButton.createActionRow([b1, b2], 1);
    expect(rows.length).toBe(2);
});

test("createActionRow throws on invalid perLine", () => {
    const b = new AppButton("A", mock(() => {}));
    expect(() => AppButton.createActionRow([b], 6)).toThrow();
});
