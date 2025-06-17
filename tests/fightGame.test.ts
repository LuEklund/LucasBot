import { test, expect } from "bun:test";
import FightGame from "../src/commands/Fight/fightGame";

const user = (id: string) => ({ discord: { id, displayName: id } }) as any;

test("getAppUserByID returns correct user", () => {
    const game = new FightGame(user("1"), user("2"), 5);
    const result = game.getAppUserByID("2");
    expect(result?.discord.id).toBe("2");
});

test("createStatBar builds bar", async () => {
    const game = new FightGame(user("1"), user("2"), 5);
    const bar = await game.createStatBar(5, 10, 10, "31");
    expect(bar).toContain("5.00/10.00");
});
