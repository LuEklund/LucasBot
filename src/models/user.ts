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

export const UserModel = UserDB.Model;

export async function getIdFromUser(user: string | { id: string }): Promise<string> {
    return typeof user === "string" ? user : user.id;
}

export async function getUserFromId(id: string): Promise<UserDB.Document | null> {
    return UserModel.findOne({ id });
}

export async function giveXP(id: string, amount: number): Promise<number> {
    const user = await UserModel.findOne({ id });
    if (!user) return 0;
    user.xp += amount;
    await user.save();
    return amount;
}

export async function setXP(id: string, xp: number): Promise<number> {
    const user = await UserModel.findOne({ id });
    if (!user) return 0;
    if (xp > 0 && user.timeouts > 0) {
        const maxTimeoutsForReduction = 20;
        const minTimeoutsForReduction = 1;
        let reductionFactor =
            (user.timeouts - minTimeoutsForReduction) /
            (maxTimeoutsForReduction - minTimeoutsForReduction);
        reductionFactor = Math.max(0, Math.min(1, reductionFactor));
        xp = xp * (1 - reductionFactor);
    }
    user.xp = xp;
    await user.save();
    return xp;
}

export async function giveGold(id: string, amount: number): Promise<number> {
    const user = await UserModel.findOne({ id });
    if (!user) return 0;
    user.balance = (user as any).balance + amount;
    await user.save();
    return amount;
}

export async function setGold(id: string, amount: number): Promise<number> {
    const user = await UserModel.findOne({ id });
    if (!user) return 0;
    user.balance = amount;
    await user.save();
    return amount;
}
