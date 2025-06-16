import { test, expect, spyOn, mock } from "bun:test";
import { Quest } from "../src/quest";
import { QuestModel } from "../src/models/quest";

class DummyQuest extends Quest {
    async startQuest() {}
}

test("loadQuests loads quests", async () => {
    await Quest.loadQuests();
    const quests = Quest.getQuests();
    expect(quests.length).toBeGreaterThan(0);
    expect(Quest.getQuest("test")).toBeDefined();
});

test("getQuestData fetches from model", async () => {
    const quest = new DummyQuest();
    quest.fileName = "dummy";
    const doc = { title: "foo" } as any;
    const spy = spyOn(QuestModel, "findOne").mockResolvedValue(doc);
    const result = await quest.getQuestData();
    expect(result).toBe(doc);
    expect(spy).toHaveBeenCalledWith({ className: "dummy" });
    spy.mockRestore();
});
