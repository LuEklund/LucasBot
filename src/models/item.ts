import mongoose, { type Document as MDocument, Schema } from "mongoose";

export namespace ItemDB {
    export const Types = ["weapon", "shield", "helmet", "chestplate", "leggings", "boots", "item"] as const;

    export const schema = new Schema({
        name: { type: String, required: true },
        cost: { type: Number, required: true },
        type: { type: String, required: true },
        flatModifiers: {
            type: Map,
            of: Number,
            default: new Map(),
        },
        percentageModifiers: {
            type: Map,
            of: Number,
            default: new Map(),
        },
    });

    export interface Document extends MDocument {
        name: string;
        cost: number;
        type: string; // renamed here too
        flatModifiers: Map<string, number>;
        percentageModifiers: Map<string, number>;
    }

    export type ModelType = mongoose.Model<Document>;
    export const Model = mongoose.model<Document>("Item", schema);

    export async function getFromName(name: string): Promise<Document | null> {
        try {
            return await Model.findOne({ name }).exec();
        } catch (error) {
            console.error(`[Item.getFromName] Failed to fetch item "${name}":`, error);
            return null;
        }
    }

    export async function getRandom(): Promise<Document | null> {
        try {
            const randomItems = await Model.aggregate<Document>([{ $sample: { size: 1 } }]);
            return randomItems.length > 0 ? randomItems[0]! : null;
        } catch (error) {
            console.error("[Item.getRandom] Failed to fetch random item:", error);
            return null;
        }
    }

    export function getStringCollection(items: Array<Document>): string {
        if (items.length === 0) return "None";

        return items
            .map((item) => {
                let itemDetails = `**${item.name}**`;

                const flatStatsParts: string[] = [];
                for (const [statName, amplifier] of item.flatModifiers.entries()) {
                    flatStatsParts.push(`${statName}: ${amplifier}`);
                }
                if (flatStatsParts.length > 0) {
                    itemDetails += `\n${flatStatsParts.join(", ")}`;
                }

                const percentageStatsParts: string[] = [];
                for (const [statName, amplifier] of item.percentageModifiers.entries()) {
                    percentageStatsParts.push(`${statName}: ${(amplifier * 100).toFixed(0)}%`);
                }
                if (percentageStatsParts.length > 0) {
                    itemDetails += `\n${percentageStatsParts.join(", ")}`;
                }

                return itemDetails;
            })
            .join("\n");
    }
}

export const Item = undefined;
