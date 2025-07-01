import { User, Guild, GuildMember, Role, PermissionsBitField, DiscordAPIError, TextChannel, EmbedBuilder } from "discord.js";
import { client, Globals } from ".";
import { UserDB } from "./models/user";
import { InventoryDB } from "./models/inventory";
import { Item } from "./models/item";
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
        this.database.xp = Math.max(-100, Math.round(amount));

        return this;
    }

    addXP(amount: number): AppUser {
        return this.setXP(this.database.xp + amount);
    }

    setGold(amount: number): AppUser {
       this.inventory.gold = Math.max(-1000, Math.round(amount * 100) / 100);

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
        UserDB.StatDB.keys.forEach((stat) => {
            if ((this.database.stats[stat] as number) < 0) {
                (this.database.stats[stat] as number) = 0;
            }
        });

        for (let i = this.inventory.items.length - 1; i >= 0; i--) {
            const inventoryItem = this.inventory.items[i];

            if (inventoryItem?.[0]) {
                const item = Item.manager.findByName(inventoryItem[1]);
                if (!item) {
                    this.inventory.items.splice(i, 1);
                }
            }
        }

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

    async getEquippedItems(): Promise<[boolean, string][]> {
        try {
            const inventory = await InventoryDB.Model.findOne({ id: this.discord.id }).exec();
            if (!inventory) return [];

            return (inventory.items ?? []).filter(([isEquipped]) => isEquipped === true);
        } catch (error) {
            console.error(`Failed to get items for user ${this.discord.id}:`, error);
            return [];
        }
    }

    addItem(item: Item.Base): AppUser {
        this.inventory.items.push([false, item.name]);
        return this;
    }

    getStat(key: UserDB.StatDB.Type): number {
        let value: number = this.database.stats[key];
        let flat: number = 0;
        let percent: number = 1;

        for (const [_, itemName] of this.inventory.items.filter(([bool, _]) => bool)) {
            const item = Item.manager.findByName(itemName);
            if (!item) continue;

            const flatEntries = Object.entries(item.flatModifiers ?? {});
            const percentEntries = Object.entries(item.percentageModifiers ?? {});

            flatEntries.forEach(([modKey, value]) => {
                if (modKey === key) flat += value;
            });
            percentEntries.forEach(([modKey, value]) => {
                if (modKey === key) percent += value;
            });
        }

        return (value + flat) * percent;
    }

    /////////////////////////////////////////////////////////
    ///                      OTHER                         //
    /////////////////////////////////////////////////////////
    async level(xp: number): Promise<void> {
        const level = calculateLevel(xp);

        while (level > this.database.level) {
            const newLevel = this.database.level + 1;
            this.addSkillPoints(1).addGold(newLevel);
            this.database.level = newLevel;
            const embed = new EmbedBuilder()
                .setTitle(`${this.discord.displayName} leveled up! ${newLevel} ${Globals.ATTRIBUTES.level.emoji}`)
                .setDescription(`+1 ${Globals.ATTRIBUTES.skillpoint.emoji}\n+${newLevel} ${Globals.ATTRIBUTES.gold.emoji}`)
                .setColor("#D3D3D3")
                .setImage(this.discord.avatarURL());
            // .setURL(`discord.com/users${this.discord.username}`);

            await Globals.CHANNEL.send({ embeds: [embed] });
        }

        const guildId = Globals.CHANNEL.guild.id;
        const guild: Guild | undefined = await client.guilds.fetch(guildId);

        const rank = rankFromLevel(level) || "";
        if (!rank) return;

        try {
            await this.setRole(guild, rank, true);
        } catch (error: any) {
            console.log("SetRole Error: " + error);
        }
    }
}

const xpThresholds: number[] = [
    //  XP           Level
    0, //              0
    1, //              1
    50, //             2
    100, //            3
    250, //            4
    600, //            5
    1300, //           6
    2850, //           7
    6000, //           8
    15000, //          9
    30000, //          10
    60000, //          11
    120000, //         12
    250000, //         13
    500000, //         14
    1000000, //        15
];

export function calculateLevel(xp: number): number {
    for (let i = xpThresholds.length - 1; i >= 0; i--) {
        if (xp >= (xpThresholds[i] || xpThresholds[xpThresholds.length - 1]! * 2)) return i;
    }
    return 0;
}

function rankFromLevel(level: number): string | undefined {
    if ((level > 0 && level % 5 === 0) || level === 1) return `Level ${level}`;
    return undefined;
}
