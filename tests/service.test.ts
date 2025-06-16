import { test, expect, mock } from "bun:test";
import { Service } from "../src/service";

class Dummy extends Service.Base {
    start = mock(async () => {});
    stop = mock(async () => {});
}

test("start calls start on services", async () => {
    const svc = new Dummy();
    Service.services.push(svc);
    await Service.start({} as any);
    expect(svc.start).toHaveBeenCalled();
    Service.services.length = 0;
});

test("stop calls stop on services", async () => {
    const svc = new Dummy();
    Service.services.push(svc);
    await Service.stop({} as any);
    expect(svc.stop).toHaveBeenCalled();
    Service.services.length = 0;
});
