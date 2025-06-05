import { describe, expect, it } from "bun:test";
import { Quest } from "../src/core/quest";

describe("Quest", () => {
    it("loads quest classes from the quests folder", async () => {
        await Quest.loadQuests();
        expect(Quest.getQuests().length).toBeGreaterThan(0);
        const quest = Quest.getQuest("test");
        expect(quest).toBeDefined();
    });
});
