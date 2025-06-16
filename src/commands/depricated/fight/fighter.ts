import { type ItemDocument } from "@/models/item";
import { StatsModel, type UserDocument } from "@/models/user";
import { AppUser } from "@/user";

export default class Fighter {
    dbUser?: UserDocument;
    posX: number = 0;
    currentHealth: number = 0;
    currentMana: number = 0;
    imgeUrl: string = "";
    items: Array<ItemDocument> = [];
    fighterStats: StatsModel = 0 as any;

    static async create(
        dbUser: UserDocument,
        startPosition: number,
        imgUrl: string,
    ): Promise<Fighter> {
        let self = new Fighter(dbUser, startPosition, imgUrl);
        const user = await AppUser.fromID(dbUser.id);
        self.items = await user.getItems();

        self.calculateStats();
        self.currentHealth = self.getMaxHealthStats();
        self.currentMana = self.getMaxManaStats();

        return self;
    }

    private constructor(
        dbUser: UserDocument,
        startPosition: number,
        imgUrl: string,
    ) {
        this.dbUser = dbUser;
        this.posX = startPosition;
        this.imgeUrl = imgUrl;
    }

    calculateStats() {
        this.fighterStats = {
            strength: this.dbUser!.stats.strength,
            agility: this.dbUser!.stats.agility,
            charisma: this.dbUser!.stats.charisma,
            magicka: this.dbUser!.stats.magicka,
            stamina: this.dbUser!.stats.stamina,
            defense: this.dbUser!.stats.defense,
            vitality: this.dbUser!.stats.vitality,
        };
        if (this.items.length > 0) {
            for (const item of this.items) {
                for (const [key, value] of item.flatStatModifiers.entries()) {
                    this.fighterStats[key as keyof StatsModel] += value;
                }
                for (const [
                    key,
                    value,
                ] of item.percentageStatModifiers.entries()) {
                    this.fighterStats[key as keyof StatsModel] *= 1 + value;
                }
            }
        }
    }

    getMaxHealthStats(): number {
        return (this.fighterStats.vitality || 1) * 10;
    }
    getMaxManaStats(): number {
        return this.fighterStats.stamina || 1;
    }

    attack(opponent: Fighter) {
        if (Math.abs(this.posX - opponent.posX) < 2) {
            const damage = Math.random() * this.fighterStats.strength + 1;
            return opponent.receiveDamage(damage);
        } else {
            return "Too far away to attack!";
        }
    }
    receiveDamage(damage: number) {
        if (this.fighterStats.defense > 0) {
            if (Math.random() > damage / this.fighterStats.defense) {
                return this.dbUser!.username + ": Blocked the attack!";
            }
        }
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        return (
            this.dbUser!.username +
            ": Received " +
            damage.toFixed(2) +
            " damage!"
        );
    }

    gainHealth(amount: number) {
        this.currentHealth = Math.min(
            this.getMaxHealthStats(),
            this.currentHealth + amount,
        );
    }

    gainMana(amount: number) {
        this.currentMana = Math.min(
            this.getMaxManaStats(),
            this.currentMana + amount,
        );
    }

    drainMana(amount: number): boolean {
        if (this.currentMana >= amount) {
            this.currentMana -= amount;
            return true;
        }
        return false;
    }
}
