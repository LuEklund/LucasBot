import type { UserDocument } from "@/models/user";

export class Fighter {
    public readonly dbUser: UserDocument;
    public posX = 0;
    public currentHealth = 0;
    public imageUrl = "";

    constructor(dbUser: UserDocument, startPosition: number, imgUrl: string) {
        this.dbUser = dbUser;
        this.posX = startPosition;
        this.currentHealth = this.getMaxHealthStats();
        this.imageUrl = imgUrl;
    }

    getMaxHealthStats(): number {
        return this.dbUser.vitality * 10;
    }

    attack(opponent: Fighter): string {
        if (Math.abs(this.posX - opponent.posX) < 2) {
            const damage = Math.random() * this.dbUser.strength + 1;
            return opponent.receiveDamage(damage);
        }
        return "Too far away to attack!";
    }

    receiveDamage(damage: number): string {
        if (this.dbUser.defense > 0) {
            if (Math.random() > damage / this.dbUser.defense) {
                return `${this.dbUser.username}: Blocked the attack!`;
            }
        }
        this.currentHealth = Math.max(0, this.currentHealth - damage);
        return `${this.dbUser.username}: Received ${damage.toFixed(2)} damage!`;
    }
}
