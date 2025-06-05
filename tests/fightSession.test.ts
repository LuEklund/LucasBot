import { describe, expect, it } from "bun:test";
import { Fighter } from "../src/models/fighter";
import { FightSession } from "../src/services/fightSession";

const baseUser = {
    id: "u",
    username: "player",
    strength: 5,
    defense: 2,
    agility: 1,
    charisma: 0,
    magicka: 0,
    stamina: 0,
    vitality: 2,
} as any;

describe("FightSession", () => {
    it("prevents moving out of bounds", () => {
        const p1 = new Fighter({ ...baseUser, id: "1" }, 1, "");
        const p2 = new Fighter({ ...baseUser, id: "2" }, 2, "");
        const session = new FightSession([p1, p2], 3);
        session.start();
        session.moveLeft();
        expect(p1.posX).toBe(0);
        session.moveLeft();
        expect(p1.posX).toBe(0);
    });

    it("toggles turn correctly", () => {
        const p1 = new Fighter({ ...baseUser, id: "1" }, 0, "");
        const p2 = new Fighter({ ...baseUser, id: "2" }, 2, "");
        const session = new FightSession([p1, p2], 5);
        session.start();
        session.attack();
        session.toggleTurn();
        expect(session.playerTurn).toBe(1);
    });
});
