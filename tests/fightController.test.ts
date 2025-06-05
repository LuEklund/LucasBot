import { describe, expect, it, vi } from "bun:test";
import { FightController } from "../src/controllers/fight/FightController";
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

describe("FightController", () => {
    it("begins a fight and stores session", () => {
        const controller = new FightController();
        const p1 = new Fighter(baseUser, 0, "");
        const p2 = new Fighter({ ...baseUser, id: "2" }, 1, "");
        const msg = controller.beginFight("chan", p1, p2);
        expect(controller.fightService.getSession("chan")).toBeDefined();
        expect(msg.embeds.length).toBe(1);
        expect(msg.components.length).toBe(1);
    });

    it("handles interaction when no session", async () => {
        const controller = new FightController();
        const interaction: any = {
            channelId: "chan",
            user: { id: "1", username: "tester" },
            customId: "#attack",
            reply: vi.fn(),
        };
        const res = await controller.handleInteraction(interaction);
        expect(res).toBe(false);
    });
});
