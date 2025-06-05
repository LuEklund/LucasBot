import { describe, expect, it } from "bun:test";
import { FightService } from "../src/services/fightService";
import { Fighter } from "../src/models/fighter";

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

describe("FightService", () => {
    it("creates and deletes fight sessions", () => {
        const p1 = new Fighter({ ...baseUser, id: "1" }, 0, "");
        const p2 = new Fighter({ ...baseUser, id: "2" }, 1, "");
        const service = new FightService(5);
        service.createFight("channel", p1, p2);
        expect(service.getSession("channel")).toBeDefined();
        service.deleteFight("channel");
        expect(service.getSession("channel")).toBeUndefined();
    });

    it("starts fights and toggles turn", () => {
        const p1 = new Fighter({ ...baseUser, id: "1" }, 0, "");
        const p2 = new Fighter({ ...baseUser, id: "2" }, 1, "");
        const service = new FightService(5);
        service.createFight("chan", p1, p2);
        const session = service.getSession("chan")!;
        service.startFight("chan");
        expect(session.isActive).toBe(true);
        expect(session.playerTurn).toBe(0);
        service.toggleTurn(session);
        expect(session.playerTurn).toBe(1);
    });
});
