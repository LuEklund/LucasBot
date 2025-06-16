import { test, expect, spyOn, mock } from "bun:test";
import TimeoutService from "../src/services/timeout";
import { UserModel } from "../src/models/user";

const client = {} as any;

test("increments timeout when member timed out", async () => {
    const service = new TimeoutService();
    const oldMember = { communicationDisabledUntil: null } as any;
    const newMember = {
        communicationDisabledUntil: new Date(),
        id: "1",
        displayName: "foo",
    } as any;
    const spy = spyOn(UserModel, "findOneAndUpdate").mockResolvedValue({
        timeouts: 1,
    } as any);
    await (service as any).handleGuildMemberUpdate(oldMember, newMember);
    expect(spy).toHaveBeenCalledWith(
        { id: "1" },
        { $inc: { timeouts: 1 }, username: "foo" },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    spy.mockRestore();
});

test("start registers guild member update handler", () => {
    const client = { on: mock(() => {}), off: mock(() => {}) } as any;
    const service = new TimeoutService();
    service.start(client);
    expect(client.on).toHaveBeenCalled();
});

test("stop unregisters guild member update handler", () => {
    const client = { on: mock(() => {}), off: mock(() => {}) } as any;
    const service = new TimeoutService();
    service.stop(client);
    expect(client.off).toHaveBeenCalled();
});
