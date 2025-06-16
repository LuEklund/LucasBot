import { test, expect, mock } from "bun:test";
import ButtonService from "../src/services/button";
import { AppButton } from "../src/button";

const createInteraction = () =>
    ({
        isButton: () => true,
        customId: "#id",
    }) as any;

test("start registers handler", () => {
    const client = { on: mock(() => {}), off: mock(() => {}) } as any;
    const service = new ButtonService();
    service.start(client);
    expect(client.on).toHaveBeenCalled();
});

test("stop unregisters handler", () => {
    const client = { on: mock(() => {}), off: mock(() => {}) } as any;
    const service = new ButtonService();
    service.stop(client);
    expect(client.off).toHaveBeenCalled();
});

test("handleButton calls onPress", async () => {
    const press = mock(() => {});
    const btn = new AppButton("label", press);
    const service = new ButtonService();
    const interaction: any = { isButton: () => true, customId: btn.id };
    await (service as any).handleButton(interaction);
    expect(press).toHaveBeenCalled();
    AppButton.buttons.clear();
});
