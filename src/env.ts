const required = (key: string): string => {
    const val = process.env[key];
    if (!val) {
        console.warn(`${key} is not defined in environment`);
        return "";
    }
    return val;
};

export const env = {
    BOT_TOKEN: required("BOT_TOKEN"),
    MONGO_URI: process.env.MONGO_URI ?? process.env.DATABASE_URL ?? "mongodb://localhost:27017/mydiscordapp",
    QUEST_CHANNEL_ID: required("QUEST_CHANNEL_ID"),
};
