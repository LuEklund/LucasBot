import { test, expect, spyOn, mock } from "bun:test";
import { getIdFromUser, giveXP, UserModel } from "../src/models/user";

test("getIdFromUser with string", async () => {
    const id = await getIdFromUser("123");
    expect(id).toBe("123");
});

test("getIdFromUser with object", async () => {
    const id = await getIdFromUser({ id: "abc" } as any);
    expect(id).toBe("abc");
});

test("giveXP adds xp and saves", async () => {
    const user = {
        id: "u1",
        xp: 0,
        timeouts: 0,
        save: mock(() => Promise.resolve()),
    } as any;
    const spy = spyOn(UserModel, "findOne").mockResolvedValue(user);
    const added = await giveXP("u1", 5);
    expect(added).toBe(5);
    expect(user.xp).toBe(5);
    expect(user.save).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ id: "u1" });
    spy.mockRestore();
});
