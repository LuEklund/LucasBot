import { test, expect, mock, spyOn } from "bun:test";
import QuestCommand from "../src/commands/quest";
import { Quest } from "../src/quest";

test("onExecute starts quest with name", async () => {
    const startSpy = spyOn(Quest, "start").mockResolvedValue();
    const cmd = new QuestCommand();
    const interaction: any = {
        options: { get: () => ({ value: "q1" }) },
        reply: mock(async () => {}),
    };
    await cmd.onExecute(interaction);
    expect(startSpy).toHaveBeenCalledWith("q1");
    expect(interaction.reply).toHaveBeenCalled();
    startSpy.mockRestore();
});

test("onEnd ends quest", async () => {
    const endSpy = spyOn(Quest, "end").mockResolvedValue({});
    const cmd = new QuestCommand();
    const interaction: any = {
        options: { get: () => ({ value: "q2" }) },
        reply: mock(async () => {}),
    };
    await cmd.onEnd(interaction);
    expect(endSpy).toHaveBeenCalledWith("q2");
    expect(interaction.reply).toHaveBeenCalled();
    endSpy.mockRestore();
});

test("onAutocomplete lists quests", async () => {
    Quest.quests.clear();
    Quest.quests.set("questA", {} as any);
    const cmd = new QuestCommand();
    const interaction: any = {
        options: { getSubcommand: () => "execute" },
        respond: mock(async () => {}),
    };
    await cmd.onAutocomplete(interaction);
    expect(interaction.respond).toHaveBeenCalledWith([{ name: "questA", value: "questA" }]);
});
