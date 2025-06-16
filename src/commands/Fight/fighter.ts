import type { AppUser } from "@/user";

export default class Fighter {
    appUser!: AppUser;
    posX: number = 0;
    currentHealth: number = 0;
    currentMana: number = 0;

    constructor(appUser: AppUser) {
        this.appUser = appUser;
    }

    getMaxHealthStats(): number {
        return (this.appUser.database.stats.vitality || 1) * 10;
    }
    getMaxManaStats(): number {
        return this.appUser.database.stats.stamina || 1;
    }
}
