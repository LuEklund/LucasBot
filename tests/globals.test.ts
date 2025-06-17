import { test, expect } from "bun:test";
import { Globals } from "../src/globals";

test("random returns within range", () => {
    for (let i = 0; i < 10; i++) {
        const value = Globals.random(10, 5);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThan(10);
    }
});
