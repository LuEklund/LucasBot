import mongoose, { Document, Schema } from "mongoose";
import { User } from "discord.js";

const userSchema = new Schema(
    {
        id: { type: String },
        username: { type: String },
        timeouts: { type: Number, default: 0.0 },
        xp: { type: Number, default: 0.0 },
        lastXpMessageAt: { type: Schema.Types.Date, default: Date.now },
        balance: { type: Number, default: 0.0 },
        skillPoints: { type: Number, default: 0.0 },
        strength: { type: Number, default: 0.0 },
        agility: { type: Number, default: 0.0 },
        charisma: { type: Number, default: 0.0 },
        magicka: { type: Number, default: 0.0 },
        stamina: { type: Number, default: 0.0 },
        defense: { type: Number, default: 0.0 },
        currentHealth: { type: Number, default: 0.0 },
        maxHealth: { type: Number, default: 0.0 },
        currentArmor: { type: Number, default: 0.0 },
        maxArmor: { type: Number, default: 0.0 },
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
    strength: number;
    agility: number;
    charisma: number;
    magicka: number;
    stamina: number;
    defense: number;
    currentHealth: number;
    maxHealth: number;
    currentArmor: number;
    maxArmor: number;
}

export type UserModel = mongoose.InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model<UserDocument>("User", userSchema);

export class SuperUser {
    discord: User;
    db: any;

    private constructor(user: User, dbUser: any) {
        this.discord = user;
        this.db = dbUser;
    }

    static async create(user: User): Promise<SuperUser> {
        let dbUser = await UserModel.findOne({ id: user.id });
        if (!dbUser) {
            console.error("Help");
        }
        return new SuperUser(user, dbUser);
    }

    async giveXP(xp: number) {
        this.db.xp = Math.max(-100, this.db.xp + xp);
        this.save()
    }

    async save() {
        await this.db.save();
    }
}