import { test, expect, spyOn, mock } from "bun:test";
import { BotServices } from "../src/services/botServices";

const createServices = () => {
    const client = { on: mock(() => {}), off: mock(() => {}) } as any;
    const logger = { info: mock(() => {}), error: mock(() => {}) } as any;
    const services = new BotServices(client, logger);
    return { services, client, logger };
};

test("start delegates to internal services", () => {
    const { services, logger } = createServices();
    const mrs = (services as any).messageResponderService;
    const tts = (services as any).timeoutTrackingService;
    const mrsStart = spyOn(mrs, "start").mockReturnValue();
    const ttsStart = spyOn(tts, "start").mockReturnValue();

    services.start();

    expect(mrsStart).toHaveBeenCalled();
    expect(ttsStart).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Bot Services starting.");

    mrsStart.mockRestore();
    ttsStart.mockRestore();
});

test("stop delegates to internal services", () => {
    const { services, logger } = createServices();
    const mrs = (services as any).messageResponderService;
    const tts = (services as any).timeoutTrackingService;
    const mrsStop = spyOn(mrs, "stop").mockReturnValue();
    const ttsStop = spyOn(tts, "stop").mockReturnValue();

    services.stop();

    expect(mrsStop).toHaveBeenCalled();
    expect(ttsStop).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Bot Services stopped.");

    mrsStop.mockRestore();
    ttsStop.mockRestore();
});
