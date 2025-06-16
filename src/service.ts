import type { Client } from "discord.js";

export namespace Service {
    export abstract class Base {
        public async start(client: Client): Promise<void> {}
        public async stop(client: Client): Promise<void> {}
    }

    export const services: Base[] = [];

    export async function load(client: Client) {
        const glob = new Bun.Glob("./src/services/*.ts");
        console.log(`Loaded services:`);

        for (const path of glob.scanSync(".")) {
            const { default: ServiceClass } = await import(path.replace("./src/", "./"));
            const instance: Base = new ServiceClass();
            services.push(instance);
            console.log(`\t${instance.constructor.name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()}`);
        }
    }

    export async function start(client: Client) {
        for (const service of services) {
            await service.start(client);
        }
    }

    export async function stop(client: Client) {
        for (const service of services) {
            await service.stop(client);
        }
    }
}
