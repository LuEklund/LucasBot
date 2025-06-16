import mongoose, { Document as MDocument, Schema } from "mongoose";

export namespace UserDB {
    export namespace StatDB {
        export const schema = new Schema(
            {
                strength: { type: Number, default: 3.0 },
                agility: { type: Number, default: 10.0 },
                charisma: { type: Number, default: 1.0 },
                magicka: { type: Number, default: 1.0 },
                stamina: { type: Number, default: 3.0 },
                defense: { type: Number, default: 3.0 },
                vitality: { type: Number, default: 1.0 },
            },
            { _id: false },
        );

        export interface Document extends MDocument {
            strength: number;
            agility: number;
            charisma: number;
            magicka: number;
            stamina: number;
            defense: number;
            vitality: number;
        }

        export type Model = mongoose.InferSchemaType<typeof StatDB.schema>;
        export const Model = mongoose.model<StatDB.Document>("Stats", StatDB.schema);
    }

    export const schema = new Schema(
        {
            id: { type: String, required: true, unique: true },
            username: { type: String, required: true },
            timeouts: { type: Number, default: 0.0 },
            level: { type: Number, default: 0 },
            xp: { type: Number, default: 0.0 },
            lastXpMessageAt: { type: Date, default: Date.now },
            skillPoints: { type: Number, default: 0.0 },
            stats: {
                type: StatDB.schema,
                default: () => ({
                    strength: 3.0,
                    agility: 10.0,
                    charisma: 1.0,
                    magicka: 1.0,
                    stamina: 3.0,
                    defense: 3.0,
                    vitality: 1.0,
                }),
            },
            portalsEntered: { type: Number, default: 0.0 },
        },
        { timestamps: true },
    );

    export interface Document extends MDocument {
        id: string;
        username: string;
        timeouts: number;
        level: number;
        xp: number;
        lastXpMessageAt: Date;
        skillPoints: number;
        stats: StatDB.Document;
        portalsEntered: number;
        createdAt: Date;
        updatedAt: Date;
    }

    export type Model = mongoose.InferSchemaType<typeof schema>;
    export const Model = mongoose.model<Document>("User", schema);
}

export const UserModel = undefined;
