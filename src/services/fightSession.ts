import { Fighter } from "@/models/fighter";

export class FightSession {
    public isActive = false;
    public playerTurn: 0 | 1 = 1;

    constructor(
        public readonly players: [Fighter, Fighter],
        public readonly arenaSize: number,
    ) {}

    start(): void {
        this.isActive = true;
        this.playerTurn = 0;
    }

    validateTurn(id: string): boolean {
        if (this.playerTurn === 0 && id === this.players[0].dbUser.id) {
            return true;
        }
        if (this.playerTurn === 1 && id === this.players[1].dbUser.id) {
            return true;
        }
        return false;
    }

    moveLeft(): void {
        const current = this.players[this.playerTurn];
        if (current.posX > 0) {
            current.posX -= 1;
        }
    }

    moveRight(): void {
        const current = this.players[this.playerTurn];
        if (current.posX < this.arenaSize - 1) {
            current.posX += 1;
        }
    }

    attack(): string {
        const current = this.players[this.playerTurn];
        const opponent = this.players[this.playerTurn === 0 ? 1 : 0];
        return current.attack(opponent);
    }

    flee(random = Math.random): boolean {
        const current = this.players[this.playerTurn];
        return current.dbUser.agility / 100 > random();
    }

    toggleTurn(): void {
        this.playerTurn = this.playerTurn === 0 ? 1 : 0;
    }
}
