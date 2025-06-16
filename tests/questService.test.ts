import { test, expect, mock, spyOn } from "bun:test";
import QuestService from "../src/services/quest";
import { Quest } from "../src/quest";

class DummyQuest extends Quest.Base {
    public buttons = [] as any[];
    start = mock(async () => ({ edit: mock(async () => {}) }) as any);
}

test("start sets interval", () => {
    const service = new QuestService();
    const client = {} as any;
    const spy = spyOn(global, "setInterval").mockReturnValue(123 as any);
    service.start(client);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
});

test("stop clears interval", () => {
    const service = new QuestService();
    const client = {} as any;
    const setSpy = spyOn(global, "setInterval").mockReturnValue(456 as any);
    const clearSpy = spyOn(global, "clearInterval").mockReturnValue();
    service.start(client);
    service.stop(client);
    expect(clearSpy).toHaveBeenCalled();
    setSpy.mockRestore();
    clearSpy.mockRestore();
});
