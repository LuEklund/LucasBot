import { describe, expect, it } from "bun:test";
import { Fighter } from "../src/models/fighter";

const baseUser = {
    id: "1",
    username: "tester",
    strength: 5,
    defense: 2,
    agility: 1,
    charisma: 0,
    magicka: 0,
    stamina: 0,
    vitality: 2,
} as any;

describe("Fighter", () => {
    it("calculates max health", () => {
        const f = new Fighter(baseUser, 0, "");
        expect(f.getMaxHealthStats()).toBe(20);
    });

    it("deals damage when attacking", () => {
        const attacker = new Fighter({ ...baseUser }, 0, "");
        const defender = new Fighter({ ...baseUser }, 1, "");
        attacker.attack(defender);
        expect(defender.currentHealth).toBeLessThan(
            defender.getMaxHealthStats(),
        );
    });
});
