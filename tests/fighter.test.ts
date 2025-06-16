import { test, expect } from "bun:test";
import Fighter from "../src/commands/Fight/fighter";

const createAppUser = (vitality: number, stamina: number) =>
    ({
        database: { stats: { vitality, stamina } },
    }) as any;

test("getMaxHealthStats and getMaxManaStats use user stats", () => {
    const appUser = createAppUser(3, 5);
    const fighter = new Fighter(appUser);
    expect(fighter.getMaxHealthStats()).toBe(30);
    expect(fighter.getMaxManaStats()).toBe(5);
});
