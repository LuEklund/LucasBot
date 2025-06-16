import { test, expect, spyOn, mock } from "bun:test";
import {
    getUserFromId,
    setXP,
    giveGold,
    setGold,
    UserModel,
} from "../src/models/user";

test("getUserFromId returns db user", async () => {
    const user = { id: "u1" } as any;
    const spy = spyOn(UserModel, "findOne").mockResolvedValue(user);
    const result = await getUserFromId("u1");
    expect(result).toBe(user);
    expect(spy).toHaveBeenCalledWith({ id: "u1" });
    spy.mockRestore();
});

test("setXP sets xp with reduction", async () => {
    const user = { xp: 0, timeouts: 2, save: mock(async () => {}) } as any;
    const spy = spyOn(UserModel, "findOne").mockResolvedValue(user);
    const updated = await setXP("u1", 10);
    expect(spy).toHaveBeenCalledWith({ id: "u1" });
    expect(user.xp).toBeCloseTo(10 * (1 - (2 - 1) / (20 - 1)), 5);
    expect(updated).toBeCloseTo(10 * (1 - (2 - 1) / (20 - 1)), 5);
    expect(user.save).toHaveBeenCalled();
    spy.mockRestore();
});

test("giveGold increases balance", async () => {
    const user = { balance: 5, save: mock(async () => {}) } as any;
    const spy = spyOn(UserModel, "findOne").mockResolvedValue(user);
    const amount = await giveGold("u1", 10);
    expect(amount).toBe(10);
    expect(user.balance).toBe(15);
    expect(user.save).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ id: "u1" });
    spy.mockRestore();
});

test("setGold sets balance", async () => {
    const user = { balance: 0, save: mock(async () => {}) } as any;
    const spy = spyOn(UserModel, "findOne").mockResolvedValue(user);
    const amount = await setGold("u1", 20);
    expect(amount).toBe(20);
    expect(user.balance).toBe(20);
    expect(user.save).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ id: "u1" });
    spy.mockRestore();
});
