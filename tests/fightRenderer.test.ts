import { describe, expect, it } from "bun:test";
import { FightRenderer } from "../src/services/fightRenderer";

describe("FightRenderer", () => {
    it("creates a health bar of correct length", () => {
        const r = new FightRenderer();
        const bar = r.createHealthBar(5, 10, 4);
        expect(bar.includes("██")).toBe(true);
    });
});
