import { Client, type TextChannel, type Message } from "discord.js";
import type { AppButton } from "./button";
import { client } from ".";

export namespace Quest {
    export abstract class Base {
        public abstract buttons: AppButton[];

        public message: Message<true> = undefined!;
        public name: string = undefined!;

        public maxTimeActiveMS: number = 1000 * 60 * 10;
        public endTime: number = 0;
        public readonly isActive: boolean = false;

        public async start(): Promise<Message<true>> {
            return undefined!;
        }
        public async end(): Promise<EndReturn> {
            return Quest.end(this.name);
        }

        get class(): new (...args: any[]) => this {
            return this.constructor as new (...args: any[]) => this;
        }
    }

    export const quests: Map<string, Base> = new Map();
    export const active: Map<string, Base> = new Map();

    export async function load() {
        const glob = new Bun.Glob("src/quests/*.ts");
        console.log(`Loaded quests:`);

        for (const path of glob.scanSync(".")) {
            const { default: QuestClass } = await import(path.replace("src/quests/", "./quests/"));
            const quest: Base = new QuestClass();

            const name = path
                .split("/")
                .pop()
                ?.replace(".ts", "")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .toLowerCase()!;
            quest.name = name;

            console.log(`\t${name}`);
            quests.set(name, quest);
        }
    }

    export async function start(name: string) {
        try {
            console.log(`try to start quest: ${name}`);
            const oldQuest = await quests.get(name);
            if (!oldQuest) return console.log(`Failed to get quest: '${name}'`);
            // Quest.end(oldQuest.name);
            const quest = new oldQuest.class();
            quest.name = oldQuest.name;
            quest.endTime = new Date().getTime() + quest.maxTimeActiveMS;
            (quest as any).isActive = true;
            quest.message = await quest.start();

            quests.set(name, quest);
            active.set(name, quest);
        } catch (error) {
            console.error(`Failed to start quest: ${name}`, error);
        }
    }

    export interface EndReturn {}

    export async function end(name: string): Promise<EndReturn> {
        try {
            const quest = await quests.get(name);
            if (!quest) {
                console.log(`Failed to get quest: '${name}'`);
                return {};
            }

            if (quest.isActive) quest.end();
            (quest as any).isActive = false;
            quest.message.edit({
                components: [],
            });
            active.delete(name);
        } catch (error) {
            console.error(`Failed to start quest: ${name}`, error);
        }

        return {};
    }
}
