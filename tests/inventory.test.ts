import { test, expect } from "bun:test";
import { InventoryDB } from "../src/models/inventory";

test("inventory schema has expected defaults", () => {
    const obj = InventoryDB.schema.obj as any;
    expect(obj.gold.default).toBe(0);
    expect(obj.items.default).toEqual([]);
});
