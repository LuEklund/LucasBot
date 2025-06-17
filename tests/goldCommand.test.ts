import { test, expect, mock, spyOn } from "bun:test";
import GoldCommand from "../src/commands/gold";
import { AppUser } from "../src/user";

test("onSet sets user gold", async () => {
    const user = {
        discord: "User",
        setGold: mock(() => user),
        save: mock(async () => {}),
    } as any;
    const userSpy = spyOn(AppUser, "fromID").mockResolvedValue(user);
    const cmd = new GoldCommand();
    const interaction: any = {
        options: {
            get: (name: string) => (name === "user" ? { user: { id: "1" } } : { value: 10 }),
        },
        reply: mock(async () => {}),
    };
    await cmd.onSet(interaction);
    expect(user.setGold).toHaveBeenCalledWith(10);
    expect(user.save).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith("Set 10 gold to User");
    userSpy.mockRestore();
});

test("onAdd adds user gold", async () => {
    const user = {
        discord: "User",
        addGold: mock(() => user),
        save: mock(async () => {}),
    } as any;
    const userSpy = spyOn(AppUser, "fromID").mockResolvedValue(user);
    const cmd = new GoldCommand();
    const interaction: any = {
        options: {
            get: (name: string) => (name === "user" ? { user: { id: "1" } } : { value: 5 }),
        },
        reply: mock(async () => {}),
    };
    await cmd.onAdd(interaction);
    expect(user.addGold).toHaveBeenCalledWith(5);
    expect(user.save).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith("Added 5 gold to User");
    userSpy.mockRestore();
});
