import type { ButtonInteraction, Client } from "discord.js";
import { QuestModel, type QuestDocument } from "../models/quest";

export abstract class Quest {
    public async onButtonInteract(
        client: Client,
        interaction: ButtonInteraction,
    ): Promise<boolean> {
        return false;
    }
    public abstract startQuest(client: Client): Promise<void>;

    private static quests: Map<string, Quest> = new Map();

    public fileName = "";

    public static async loadQuests() {
        const glob = new Bun.Glob("src/quests/*.ts");

        for (const path of glob.scanSync(".")) {

            const { default: QuestClass } = await import(
                path.replace("src/quests/", "../quests/")
            );
            const quest: Quest = new QuestClass();

            quest.fileName = path.split("/").pop()?.replace(".ts", "")!;

            Quest.quests.set(quest.fileName, quest);
            console.log(`Registered quest: ${quest.fileName}`);
        }
    }

    public async getQuestData(): Promise<QuestDocument> {
        return (await QuestModel.findOne({ className: this.fileName }))!;
    }

    public static getQuest(name: string): Quest | undefined {
        return Quest.quests.get(name);
    }
    public static getQuests(): Quest[] {
        return Array.from(Quest.quests.values());
    }
}
