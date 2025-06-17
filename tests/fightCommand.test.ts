import { test, expect, mock, spyOn } from "bun:test";
import FightCommand from "../src/commands/fight";
import { AppUser } from "../src/user";

function createInteraction(userId: string, opponentId: string, bet: number) {
    return {
        user: { id: userId },
        options: {
            get: (name: string) => {
                if (name === "opponent") return { user: { id: opponentId } };
                if (name === "bet") return { value: bet };
                return {};
            },
        },
        reply: mock(async () => {}),
    } as any;
}

test("isUserPartOfFight finds game", () => {
    const cmd = new FightCommand();
    const game = { getAppUserByID: (id: string) => (id === "a" ? {} : undefined) } as any;
    cmd.games.set(1, game);
    expect(cmd.isUserPartOfFight("a")).toBe(game);
    expect(cmd.isUserPartOfFight("b")).toBeUndefined();
});

test("onExecute blocks fighting yourself", async () => {
    const cmd = new FightCommand();
    const interaction = createInteraction("1", "1", 5);
    await cmd.onExecute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({ content: `You cant fight youself`, flags: "Ephemeral" });
});

test("onExecute blocks when players cant afford bet", async () => {
    const cmd = new FightCommand();
    const interaction = createInteraction("1", "2", 50);
    const opponent = { inventory: { gold: 10 }, discord: {} } as any;
    const current = { inventory: { gold: 10 }, discord: {} } as any;
    const spy = spyOn(AppUser, "fromID");
    spy.mockResolvedValueOnce(opponent);
    spy.mockResolvedValueOnce(current);
    await cmd.onExecute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({ content: `One of the players cant afford the bet`, flags: "Ephemeral" });
    spy.mockRestore();
});
