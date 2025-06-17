import { test, expect, mock, spyOn } from "bun:test";
import XpCommand from "../src/commands/xp";
import { UserModel } from "../src/models/user";
import { AppUser } from "../src/user";

function mockFind(returnValue: any[]) {
    return spyOn(UserModel, "find").mockReturnValue({
        sort: () => ({
            limit: () => ({ exec: async () => returnValue }),
        }),
    } as any);
}

test("onTop replies when no users", async () => {
    const findSpy = mockFind([]);
    const cmd = new XpCommand();
    const interaction: any = { reply: mock(async () => {}) };
    await cmd.onTop(interaction);
    expect(interaction.reply).toHaveBeenCalledWith("No users found in the leaderboard.");
    findSpy.mockRestore();
});

test("onTop builds leaderboard embed", async () => {
    const findSpy = mockFind([
        { id: "a", xp: 10 },
        { id: "b", xp: 5 },
    ]);
    const userSpy = spyOn(AppUser, "fromID");
    userSpy.mockResolvedValueOnce({ discord: { displayName: "Alice" } } as any);
    userSpy.mockResolvedValueOnce({ discord: { displayName: "Bob" } } as any);
    const cmd = new XpCommand();
    const interaction: any = { reply: mock(async () => {}) };
    await cmd.onTop(interaction);
    const embed = interaction.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe("\ud83c\udfc6 XP Leaderboard");
    expect(embed.data.description).toContain("Alice");
    expect(embed.data.description).toContain("Bob");
    findSpy.mockRestore();
    userSpy.mockRestore();
});

test("onAdd rewards xp", async () => {
    const user = {
        discord: "User",
        addXP: mock(() => user),
        save: mock(async () => {}),
    } as any;
    const userSpy = spyOn(AppUser, "fromID").mockResolvedValue(user);
    const cmd = new XpCommand();
    const interaction: any = {
        options: {
            get: (name: string) => (name === "user" ? { user: { id: "1" } } : { value: 5 }),
        },
        reply: mock(async () => {}),
    };
    await cmd.onAdd(interaction);
    expect(user.addXP).toHaveBeenCalledWith(5);
    expect(user.save).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalledWith("Added 5 xp to User");
    userSpy.mockRestore();
});
