import { test, expect, mock, spyOn } from "bun:test";
import CommandService from "../src/services/command";
import { Command } from "../src/commands";

function createClient() {
    return { on: mock(() => {}), off: mock(() => {}) } as any;
}

test("start registers handler", () => {
    const client = createClient();
    const svc = new CommandService();
    svc.start(client);
    expect(client.on).toHaveBeenCalled();
});

test("stop unregisters handler", () => {
    const client = createClient();
    const svc = new CommandService();
    svc.stop(client);
    expect(client.off).toHaveBeenCalled();
});

test("handleCommand executes main command", async () => {
    const exec = mock(async () => {});
    const cmd = { main: { name: "foo", onExecute: exec }, subs: [] } as any;
    Command.commands.set("foo", cmd);
    const svc = new CommandService();
    const interaction: any = {
        isCommand: () => true,
        isAutocomplete: () => false,
        commandName: "foo",
        options: { getSubcommand: () => false },
        reply: mock(async () => {}),
    };
    await (svc as any).handleCommand(interaction);
    expect(exec).toHaveBeenCalled();
    Command.commands.clear();
});

test("handleCommand executes subcommand", async () => {
    const subExec = mock(async () => {});
    const cmd = {
        main: { name: "foo", onExecute: mock(async () => {}) },
        subs: [{ name: "bar", onExecute: subExec }],
    } as any;
    Command.commands.set("foo", cmd);
    const svc = new CommandService();
    const interaction: any = {
        isCommand: () => true,
        isAutocomplete: () => false,
        commandName: "foo",
        options: { getSubcommand: () => "bar" },
        reply: mock(async () => {}),
    };
    await (svc as any).handleCommand(interaction);
    expect(subExec).toHaveBeenCalled();
    Command.commands.clear();
});

test("handleCommand autocomplete", async () => {
    const auto = mock(async () => {});
    const cmd = { main: { name: "foo", onExecute: mock(async () => {}), onAutocomplete: auto }, subs: [] } as any;
    Command.commands.set("foo", cmd);
    const svc = new CommandService();
    const interaction: any = {
        isCommand: () => false,
        isAutocomplete: () => true,
        commandName: "foo",
        options: { getSubcommand: () => false },
        respond: mock(async () => {}),
    };
    await (svc as any).handleCommand(interaction);
    expect(auto).toHaveBeenCalled();
    Command.commands.clear();
});
