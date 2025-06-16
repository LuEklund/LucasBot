import { test, expect, mock } from "bun:test";
import { Quest } from "../src/quest";

class DummyQuest extends Quest.Base {
    public buttons = [] as any[];
    start = mock(async () => ({ edit: mock(async () => {}) } as any));
}

test("start and end manage active quests", async () => {
    const quest = new DummyQuest();
    quest.name = "dummy";
    Quest.quests.set("dummy", quest);

    await Quest.start("dummy");
    expect(Quest.active.get("dummy")).toBeDefined();

    await Quest.end("dummy");
    expect(Quest.active.get("dummy")).toBeUndefined();
});
