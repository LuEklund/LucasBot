import { User, Guild, GuildMember, Role, PermissionsBitField, DiscordAPIError, TextChannel, EmbedBuilder } from "discord.js";
import { client } from ".";
import { UserDB } from "./models/user";
import { InventoryDB } from "./models/inventory";
import { ItemDB } from "./models/item";
import Fighter from "./commands/Fight/fighter";

export class AppUser {
    discord: User;
    database: UserDB.Document;
    fighter!: Fighter;
    inventory: InventoryDB.Document;

    private constructor(discordUser: User, databaseUser: UserDB.Document, inventory: InventoryDB.Document) {
        this.discord = discordUser;
        this.database = databaseUser;
        this.inventory = inventory;
        this.fighter = new Fighter(this);
    }

    static async fromID(userId: string): Promise<AppUser> {
        try {
            const discord = await client.users.fetch(userId);
            const database = await AppUser.getDatabase(discord);
            const inventory = await AppUser.getInventory(discord);
            return new AppUser(discord, database, inventory);
        } catch (error: any) {
            console.warn(`Failed to fetch user ${userId}: ${error}`);
            throw new Error(`Failed to fetch user`);
        }
    }

    private static async getDatabase(user: User): Promise<UserDB.Document> {
        try {
            const database = await UserDB.Model.findOneAndUpdate(
                { id: user.id },
                {
                    $setOnInsert: {
                        id: user.id,
                        username: user.username,
                    },
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                },
            );

            if (!database) throw new Error("Database user creation or retrieval returned null");

            return database;
        } catch (error) {
            console.error(`Error retrieving or creating user ${user.id}:`, error);
            throw new Error(`Failed to retrieve or create user for ID ${user.id}`);
        }
    }

    private static async getInventory(user: User): Promise<InventoryDB.Document> {
        try {
            const inventory = await InventoryDB.Model.findOneAndUpdate(
                { id: user.id },
                {
                    $setOnInsert: {
                        id: user.id,
                    },
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                },
            );

            if (!inventory) throw new Error("Inventory creation or retrieval returned null");

            return inventory;
        } catch (error) {
            console.error(`Error retrieving or creating inventory ${user.id}:`, error);
            throw new Error(`Failed to retrieve or create inventory for ID ${user.id}`);
        }
    }

    async getGuildMember(guild: Guild): Promise<GuildMember> {
        const member = await guild.members.fetch(this.discord.id);

        if (!member) throw new Error(`User with ID "${this.discord.id}" is not a member of the guild "${guild.name}"`);

        return member;
    }

    async setRole(guild: Guild, name: string, state: boolean): Promise<void> {
        try {
            const botMember: GuildMember | null = guild.members.me;
            if (!botMember) throw new Error(`Bot cannot manage member roles in another guild ${guild.name}`);

            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles))
                throw new Error(`Bot is missing 'Manage Roles' permission in guild "${guild.name}".`);

            const role: Role | undefined = guild.roles.cache.find(
                (role) => role.name.toLowerCase() === new String(name).toLowerCase() || role.id === name,
            );
            if (!role) throw new Error(`Role '${name}' not found in guild '${guild.name}'`);

            if (role.position >= botMember.roles.highest.position)
                throw new Error(`Cannot assign role '${role.name}' because it is equal to or higher than my highest role`);

            // Prevent assigning @everyone
            if (role.id === guild.id) return;

            if (state) (await this.getGuildMember(guild)).roles.add(role);
            else (await this.getGuildMember(guild)).roles.remove(role);
        } catch (error: any) {
            let errorMessage = `Error assigning role "${name}" in guild "${guild.name}" to user "${this.discord.username}": `;

            if (error instanceof DiscordAPIError) {
                errorMessage += `Discord API Error ${error.code}: ${error.message}`;
                if (error.status === 403) {
                    errorMessage += " (Missing permissions or hierarchy issue from Discord's side)";
                }
            } else if (error instanceof Error) {
                errorMessage += error.message;
            } else {
                errorMessage += String(error);
            }

            throw new Error(errorMessage);
        }
    }

    /////////////////////////////////////////////////////////
    ///                      HELPER                        //
    /////////////////////////////////////////////////////////
    setXP(amount: number): AppUser {
        if (amount > 0 && this.database.timeouts > 0) {
            const maxTimeoutsForReduction = 20;
            const minTimeoutsForReduction = 1;
            let reductionFactor = (this.database.timeouts - minTimeoutsForReduction) / (maxTimeoutsForReduction - minTimeoutsForReduction);
            reductionFactor = Math.max(0, Math.min(1, reductionFactor));
            amount = amount * (1 - reductionFactor);
        }
        this.database.xp = Math.max(-100, amount);

        return this;
    }

    addXP(amount: number): AppUser {
        return this.setXP(this.database.xp + amount);
    }

    setGold(amount: number): AppUser {
        this.inventory.gold = Math.max(-1000, amount);

        return this;
    }

    addGold(amount: number): AppUser {
        return this.setGold(this.inventory.gold + amount);
    }

    setSkillPoints(amount: number): AppUser {
        this.database.skillPoints = amount;
        return this;
    }

    addSkillPoints(amount: number): AppUser {
        return this.setSkillPoints(this.database.skillPoints + amount);
    }

    upgradeSkill(attribute: string): AppUser {
        (this.database.stats as any)[attribute]++;
        return this;
    }
    downgradeSkill(attribute: string): AppUser {
        if ((this.database.stats as any)[attribute] < 0) return this;
        (this.database.stats as any)[attribute]--;
        return this;
    }

    async save(): Promise<AppUser> {
        const stats = ["strength", "agility", "charisma", "magicka", "stamina", "defense", "vitality"] as (keyof UserDB.StatDB.Document)[];

        stats.forEach((stat) => {
            if ((this.database.stats[stat] as number) < 0) {
                (this.database.stats[stat] as number) = 0;
            }
        });

        await this.level(this.database.xp);
        await this.inventory.save();
        await this.database.save();
        return this;
    }

    /////////////////////////////////////////////////////////
    ///                     Inventory                      //
    /////////////////////////////////////////////////////////
    async getItems(): Promise<[boolean, string][]> {
        try {
            const inventory = await InventoryDB.Model.findOne({ id: this.discord.id }).exec();
            return inventory?.items ?? [];
        } catch (error) {
            console.error(`Failed to get items for user ${this.discord.id}:`, error);
            return [];
        }
    }

    addItem(item: ItemDB.Document): AppUser {
        this.inventory.items.push([false, item.name]);
        return this;
    }

    equipItem(from: number, to: number): AppUser {
        if (!this.inventory.items[from]) {
            console.warn(`Inventory item at index ${from} does not exist`);
            return this;
        }
        if (!this.inventory.items[to]) {
            console.warn(`Inventory item at index ${to} does not exist`);
            return this;
        }

        if (this.inventory.items[from][0]) this.inventory.items[from][0] = false;
        if (this.inventory.items[to][0]) this.inventory.items[to][0] = true;
        return this;
    }

    /////////////////////////////////////////////////////////
    ///                      OTHER                         //
    /////////////////////////////////////////////////////////
    async level(xp: number): Promise<void> {
        if (!process.env.QUEST_CHANNEL_ID) throw new Error("QUEST_CHANNEL_ID is not defined in .env");
        const levelChannel = (await client.channels.fetch(process.env.QUEST_CHANNEL_ID)) as TextChannel;

        const level = calculateLevel(xp);

        if (level > this.database.level) {
            this.addSkillPoints(1).addGold(level);
            this.database.level = level;
            await levelChannel.send(`${this.discord} is now level ${level}!`);
        }

        const guildId = levelChannel.guild.id;
        const guild: Guild | undefined = await client.guilds.fetch(guildId);

        const rank = rankFromLevel(level) || "";
        if (rank === "") return;

        this.setRole(guild, rank, true);
    }
}

const xpThresholds: number[] = [
    //  XP           Level
    0, //              0
    1, //              1
    50, //             2
    100, //            3
    250, //            4
    500, //            5
    1000, //           6
    1750, //           7
    2750, //           8
    4000, //           9
    5000, //          10
    7500, //          11
    9500, //          12
    10250, //         13
    15250, //         14
    20000, //         15
];

function calculateLevel(xp: number): number {
    for (let i = xpThresholds.length - 1; i >= 0; i--) {
        if (xp >= (xpThresholds[i] || xpThresholds[xpThresholds.length - 1]! * 2)) return i;
    }
    return 0;
}

function rankFromLevel(level: number): string | undefined {
    if (level > 0 && level % 5 === 0) return `Level ${level}`;
    return undefined;
}
