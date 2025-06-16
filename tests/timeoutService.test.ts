import { test, expect, spyOn, mock } from "bun:test";
import { TimeoutService } from "../src/services/timeoutService";
import { UserModel } from "../src/models/user";

const logger = { info: mock(() => {}), error: mock(() => {}) } as any;

const client = {} as any;

test("increments timeout when member timed out", async () => {
    const service = new TimeoutService(client, logger);
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
