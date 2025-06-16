import { test, expect } from "bun:test";
import { Command } from "../src/commands";
import { ApplicationCommandOptionType } from "discord.js";

class Dummy extends Command.Base {
    public override main = new Command.Command("dummy", "desc", [
        {
            name: "opt",
            description: "an option",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ]);
    public override subs = [new Command.Command("sub", "subdesc", [])];
}

test("slash builder includes main data and subcommands", () => {
    const cmd = new Dummy();
    const json = cmd.slash.toJSON();
    expect(json.name).toBe("dummy");
    expect(json.description).toBe("desc");
    expect(json.options?.some((o) => o.type === ApplicationCommandOptionType.Subcommand && o.name === "sub")).toBe(true);
});
