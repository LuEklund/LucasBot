import { User, type PartialUser } from "discord.js";
import mongoose, { Document, Schema } from "mongoose";

const userSchema = new Schema(
    {
        id: { type: String },
        username: { type: String },
        timeouts: { type: Number, default: 0.0 },
        xp: { type: Number, default: 0.0 },
        lastXpMessageAt: { type: Schema.Types.Date, default: Date.now },
        balance: { type: Number, default: 0.0 },
        skillPoints: { type: Number, default: 0.0 },
        Weapon: { type: String, default: "Fists" },
        Helmet: { type: String, default: "none" },
        strength: { type: Number, default: 3.0 },
        agility: { type: Number, default: 10.0 },
        charisma: { type: Number, default: 0.0 },
        magicka: { type: Number, default: 0.0 },
        stamina: { type: Number, default: 3.0 },
        defense: { type: Number, default: 3.0 },
        vitality: { type: Number, default: 1.0 },
    },
    { timestamps: true },
);

export interface UserDocument extends Document {
    id: string;
    username: string;
    timeouts: number;
    xp: number;
    lastXpMessageAt: Date;
    balance: number;
    skillPoints: number;
    Weapon: string;
    Helmet: string;
    strength: number;
    agility: number;
    charisma: number;
    magicka: number;
    stamina: number;
    defense: number;
    vitality: number;
}

export type UserModel = mongoose.InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model<UserDocument>("User", userSchema);

export namespace DataBase {
    export async function getDBUserFromId(
        id: string,
    ): Promise<UserDocument | null> {
        try {
            const user = await UserModel.findOne({ id: id });
            return user;
        } catch (error) {
            console.error(`Failed to fetch user with ID ${id}:`, error);
            return null;
        }
    }

    export async function getIDFromUser(
        user: User | PartialUser | string,
    ): Promise<string> {
        if (typeof user === "object" && user !== null && "id" in user) {
            return String(user.id);
        }
        return user;
    }

    export async function giveXP(
        user: User | PartialUser | string,
        xp: number,
    ) {
        const id = await getIDFromUser(user);
        let dbUser = await UserModel.findOne({ id: id });
        if (!dbUser) {
            return;
        }

        if (xp > 0 && dbUser.timeouts > 0) {
            const maxTimeoutsForReduction = 20;
            const minTimeoutsForReduction = 1;
            let reductionFactor =
                (dbUser.timeouts - minTimeoutsForReduction) /
                (maxTimeoutsForReduction - minTimeoutsForReduction);
            reductionFactor = Math.max(0, Math.min(1, reductionFactor));
            xp = xp * (1 - reductionFactor);
        }

        dbUser.xp = Math.max(-100, dbUser.xp + xp);
        await dbUser.save();
        return xp;
    }

    export async function setXP(user: User | PartialUser | string, xp: number) {
        const id = await getIDFromUser(user);
        let dbUser = await UserModel.findOne({ id: id });
        if (!dbUser) {
            return;
        }
        console.log("xp: " + xp);
        if (xp > 0 && dbUser.timeouts > 0) {
            const maxTimeoutsForReduction = 20;
            const minTimeoutsForReduction = 1;
            let reductionFactor =
                (dbUser.timeouts - minTimeoutsForReduction) /
                (maxTimeoutsForReduction - minTimeoutsForReduction);
            reductionFactor = Math.max(0, Math.min(1, reductionFactor));
            xp = xp * (1 - reductionFactor);
        }
        console.log("new xp: " + xp);

        dbUser.xp = Math.max(-100, xp);
        await dbUser.save();
        return xp;
    }

    export async function giveGold(
        user: User | PartialUser | string,
        amount: number,
    ) {
        const id = await getIDFromUser(user);
        let dbUser = await UserModel.findOne({ id: id });
        if (!dbUser) {
            return;
        }

        dbUser.balance = Math.max(-1000, dbUser.balance + amount);
        await dbUser.save();
        return amount;
    }

    export async function setGold(
        user: User | PartialUser | string,
        amount: number,
    ) {
        const id = await getIDFromUser(user);
        let dbUser = await UserModel.findOne({ id: id });
        if (!dbUser) {
            return;
        }

        dbUser.balance = Math.max(-1000, amount);
        await dbUser.save();
        return amount;
    }
}
