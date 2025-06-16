import { test, expect, mock } from "bun:test";
import { MessageResponderService } from "../src/services/messageResponderService";

const GOOD_USER = "402859016457420820";
const BAD_USER = "924027166096752650";
const THUMBS_UP = "👍";
const THUMBS_DOWN = "👎";

test("reacts with thumbs up for good user", async () => {
    const client = {} as any;
    const logger = { info: mock(() => {}), error: mock(() => {}) } as any;
    const service = new MessageResponderService(client, logger);
    const msg = {
        author: { id: GOOD_USER, bot: false },
        react: mock(async () => {}),
    } as any;
    await (service as any).handleMessage(msg);
    expect(msg.react).toHaveBeenCalledWith(THUMBS_UP);
});

test("reacts with thumbs down for bad user", async () => {
    const client = {} as any;
    const logger = { info: mock(() => {}), error: mock(() => {}) } as any;
    const service = new MessageResponderService(client, logger);
    const msg = {
        author: { id: BAD_USER, bot: false },
        react: mock(async () => {}),
    } as any;
    await (service as any).handleMessage(msg);
    expect(msg.react).toHaveBeenCalledWith(THUMBS_DOWN);
});
