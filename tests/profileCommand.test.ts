import { test, expect, mock, spyOn } from "bun:test";
import ProfileCommand from "../src/commands/profile";
import { AppUser } from "../src/user";

function createUser() {
    return {
        discord: {
            displayName: "Bob",
            hexAccentColor: 0xabcdef,
            avatarURL: () => "https://example.com/avatar.png",
        },
        database: {
            stats: {
                strength: 1,
                defense: 2,
                agility: 3,
                magicka: 4,
                vitality: 5,
                stamina: 6,
                charisma: 7,
            },
        },
        inventory: { items: new Map() },
    } as any;
}

test("generateEmbed includes stats", async () => {
    const cmd = new ProfileCommand();
    const embed = await (cmd as any).generateEmbed(createUser());
    expect(embed.data.title).toContain("Bob");
    expect(embed.data.description).toContain("No items...");
});

test("onExecute replies with embed", async () => {
    const user = createUser();
    const userSpy = spyOn(AppUser, "fromID").mockResolvedValue(user);
    const cmd = new ProfileCommand();
    const embedSpy = spyOn(cmd as any, "generateEmbed").mockResolvedValue({} as any);
    const interaction: any = {
        options: { get: () => ({ user: { id: "1" } }) },
        reply: mock(async () => {}),
    };
    await cmd.onExecute(interaction);
    expect(embedSpy).toHaveBeenCalled();
    expect(interaction.reply).toHaveBeenCalled();
    embedSpy.mockRestore();
    userSpy.mockRestore();
});
