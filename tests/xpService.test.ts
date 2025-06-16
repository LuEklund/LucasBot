import { test, expect, mock, spyOn } from "bun:test";
import { Client } from "discord.js";
import mongoose from "mongoose";

function loadService() {
    spyOn(Client.prototype, "login").mockResolvedValue(undefined as any);
    spyOn(mongoose, "connect").mockResolvedValue(undefined as any);
    return import("../src/services/xp");
}

function createClient() {
    return { on: mock(() => {}), off: mock(() => {}) } as any;
}

test("start registers handlers", async () => {
    const { default: XpService } = await loadService();
    const client = createClient();
    const svc = new XpService();
    svc.start(client);
    expect(client.on).toHaveBeenCalledTimes(4);
});

test("stop unregisters handlers", async () => {
    const { default: XpService } = await loadService();
    const client = createClient();
    const svc = new XpService();
    svc.stop(client);
    expect(client.off).toHaveBeenCalledTimes(4);
});

test("message create rewards xp", async () => {
    const { default: XpService } = await loadService();
    const svc = new XpService();
    const reward = spyOn(svc as any, "rewardXp").mockResolvedValue();
    const msg: any = { author: { bot: false } };
    await (svc as any).handleMessageCreate(msg);
    expect(reward).toHaveBeenCalledWith(msg.author, 2);
    reward.mockRestore();
});

test("message delete rewards xp", async () => {
    const { default: XpService } = await loadService();
    const svc = new XpService();
    const reward = spyOn(svc as any, "rewardXp").mockResolvedValue();
    const msg: any = { author: { bot: false, id: "a" }, partial: false };
    await (svc as any).handleMessageDelete(msg);
    expect(reward).toHaveBeenCalledWith(msg.author, -2);
    reward.mockRestore();
});

test("reaction add rewards xp", async () => {
    const { default: XpService } = await loadService();
    const svc = new XpService();
    const reward = spyOn(svc as any, "rewardXp").mockResolvedValue();
    const reaction: any = { message: { author: {} } };
    const user: any = {};
    await (svc as any).handleReactionAdd(reaction, user);
    expect(reward).toHaveBeenCalledWith(reaction.message.author, 1);
    expect(reward).toHaveBeenCalledWith(user, 1);
    reward.mockRestore();
});

test("reaction remove rewards xp", async () => {
    const { default: XpService } = await loadService();
    const svc = new XpService();
    const reward = spyOn(svc as any, "rewardXp").mockResolvedValue();
    const reaction: any = { message: { author: {} } };
    const user: any = {};
    await (svc as any).handleReactionRemove(reaction, user);
    expect(reward).toHaveBeenCalledWith(user, -1);
    reward.mockRestore();
});
