import { test, expect, spyOn, mock } from "bun:test";
import { getWeaponFromName, ItemModel } from "../src/models/item";

test("getWeaponFromName returns weapon", async () => {
    const weapon = { name: "Club" } as any;
    const spy = spyOn(ItemModel, "findOne").mockResolvedValue(weapon);
    const result = await getWeaponFromName("Club");
    expect(result).toBe(weapon);
    expect(spy).toHaveBeenCalledWith({ name: "Club" });
    spy.mockRestore();
});

test("getWeaponFromName handles errors", async () => {
    const spy = spyOn(ItemModel, "findOne").mockRejectedValue(new Error("fail"));
    const errSpy = spyOn(console, "error").mockImplementation(() => {});
    const result = await getWeaponFromName("Bad");
    expect(result).toBeNull();
    expect(errSpy).toHaveBeenCalled();
    spy.mockRestore();
    errSpy.mockRestore();
});
