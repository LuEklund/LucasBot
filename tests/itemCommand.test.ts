import { test, expect, spyOn } from "bun:test";
import { Client } from "discord.js";
import mongoose from "mongoose";

async function loadCommand() {
    spyOn(Client.prototype, "login").mockResolvedValue(undefined as any);
    spyOn(mongoose, "connect").mockResolvedValue(undefined as any);
    const mod = await import("../src/commands/item");
    return mod.default;
}

test("parseModifiers splits flat and percentage modifiers", async () => {
    const ItemCommand = await loadCommand();
    const mods = ItemCommand.parseModifiers(new String("strength=10, agility=5%, stamina=3"));
    expect(mods.flatStatModifiers.get("strength")).toBe(1);
    expect(mods.flatStatModifiers.get("stamina")).toBe(0);
    expect(mods.percentageStatModifiers.get("agility")).toBe(5);
});

test("parseModifiers ignores invalid entries", async () => {
    const ItemCommand = await loadCommand();
    const mods = ItemCommand.parseModifiers(new String("invalid, magic=abc"));
    expect(mods.flatStatModifiers.size).toBe(1);
    expect(mods.percentageStatModifiers.size).toBe(0);
});
