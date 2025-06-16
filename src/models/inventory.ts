import mongoose, { Document as MDocument, Schema } from "mongoose";

export namespace InventoryDB {
    export const schema = new Schema(
        {
            id: { type: String, required: true, unique: true },
            gold: { type: Number, default: 0.0 },
            items: {
                type: Array,
                default: [],
            },
        },
        { _id: false },
    );

    export interface Document extends MDocument {
        id: string;
        gold: number;
        items: Array<[boolean, string]>;
    }

    export const Model = mongoose.model<Document>("Inventory", schema);
}
