import { AppButton } from "@/button";
import { Globals } from "@/index";
import type { AppUser } from "@/user";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    InteractionResponse,
    type InteractionUpdateOptions,
    type Message,
} from "discord.js";
import type Fighter from "./fighter";
import { getFieldImage } from "../depricated/fight/fieldGenerate";
import { Item, ItemDB } from "@/models/item";

export default class FightGame {
    appUsers: AppUser[] = [];
    bet: number = 0;
    playerTurn: number = 0;
    arenaSize: number = 6;

    private static nextId: number = 0;
    id: number = 0;

    message!: Message<true>;
    buttons: AppButton[] = [new AppButton("Accept", this.onPressAccept.bind(this)), new AppButton("Decline", this.onPressDecline.bind(this))];

    constructor(discordUser1: AppUser, discordUser2: AppUser, amount: number) {
        this.id = FightGame.nextId++;
        this.bet = amount;
        this.appUsers = [discordUser1, discordUser2];
    }
    public async sendInviteMessage() {
        const builder = new EmbedBuilder()
            .setTitle(`:crossed_swords: ${this.appUsers[0]!.discord.displayName} -VS- ${this.appUsers[1]!.discord.displayName} :crossed_swords:`)
            .setDescription(`:moneybag:**Bet: ${this.bet}**\n${this.appUsers[1]!.discord} do you accept the fight?`)
            .setTimestamp();
        const actionRow = AppButton.createActionRow(this.buttons);
        this.message = await Globals.CHANNEL.send({
            embeds: [builder],
            components: actionRow,
        });
    }
    getAppUserByID(userId: any) {
        return this.appUsers.find((player) => player.discord.id === userId);
    }

    public async onPressAccept(interaction: ButtonInteraction): Promise<InteractionResponse<true>> {
        this.message.edit(await this.getFightDisplay("test"));
        return interaction.reply("Accept");
    }
    public async onPressDecline(interaction: ButtonInteraction): Promise<InteractionResponse<true>> {
        return interaction.reply("Decline");
    }

    async createStatBar(current: number, max: number, length: number = 10, filledColorCode: string = "31"): Promise<string> {
        if (max <= 0) return ":no_entry_sign: ";
        const percentage = current / max;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        const filledBar = "█".repeat(filled);
        const emptyBar = " ".repeat(empty);
        // Using ANSI code block for better visual consistency of the bar
        return `${current.toFixed(2)}/${max.toFixed(2)}\`\`\`ansi\n[2;${filledColorCode}m${filledBar}[0m[2;37m${emptyBar}[0m\n\`\`\` `;
    }

    async getPlayerDisplay(player: Fighter, healthbar: string, manaBar: string) {
        const playerItems = await player.appUser.getItems();
        let items: ItemDB.Document[] = [];
        for (const [equipItem, itemName] of playerItems) {
            if (equipItem) {
                ItemDB.getFromName(itemName);
                if (itemName) items.push();
            }
        }
        const itemsDisplay = ItemDB.getStringCollection(items);

        return {
            name: `${player.appUser.discord}'s Status`,
            value:
                `❤️ Health: ${healthbar}\n` +
                `🔵 Mana: ${manaBar}\n` +
                `⚔️ Strength: **${player.appUser.database.stats.strength}**\n` +
                `🛡️ Defense: **${player.appUser.database.stats.defense}**\n` +
                `🏃 Agility: **${player.appUser.database.stats.agility}** \n` +
                `✨ Magicka: **${player.appUser.database.stats.magicka}**\n` +
                `🔋 Vitality: **${player.appUser.database.stats.vitality}**\n` +
                `🏃‍♂️ Stamina: **${player.appUser.database.stats.stamina}**\n` +
                `🗣️ Charisma: **${player.appUser.database.stats.charisma}**\n` +
                `📦 Items: \n${itemsDisplay}`,
            inline: true,
        };
    }

    private async getFightDisplay(action: string): Promise<InteractionUpdateOptions> {
        const currentPlayer = this.getCurrentPlayer();
        const nextPlayer = this.getNextPlayer();
        const player1 = this.appUsers[0]!.fighter;
        const player2 = this.appUsers[1]!.fighter;
        const player1HealthBar = await this.createStatBar(player1.currentHealth, player1.getMaxHealthStats(), player1.getMaxHealthStats(), "31");
        const player1ManaBar = await this.createStatBar(player1.currentMana, player1.getMaxManaStats(), player1.getMaxManaStats(), "34");
        const player2HealthBar = await this.createStatBar(player2.currentHealth, player2.getMaxHealthStats(), player2.getMaxHealthStats(), "31");
        const player2ManaBar = await this.createStatBar(player2.currentMana, player2.getMaxManaStats(), player2.getMaxManaStats(), "34");
        const player1DisplayStats = await this.getPlayerDisplay(player1, player1HealthBar, player1ManaBar);
        const player2DisplayStats = await this.getPlayerDisplay(player2, player2HealthBar, player2ManaBar);
        const fieldImageAttachment = await getFieldImage(this);
        const builder = new EmbedBuilder()
            .setColor(0x0099ff)
            .setAuthor({
                name: `It's ${nextPlayer.appUser.discord}'s Turn!`,
                iconURL: nextPlayer.appUser.discord.avatarURL()!,
            })
            .setDescription(currentPlayer.appUser.discord + ": " + action)
            .setImage("attachment://game-field.png")
            .addFields(player1DisplayStats, player2DisplayStats)
            .setFooter({
                text: `➡️ It's ${nextPlayer.appUser.discord}'s Turn!`,
                iconURL: nextPlayer.appUser.discord.avatarURL()!,
            })
            .setTimestamp();
        const allowActionsButtons = nextPlayer.currentMana < 1;
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            nextPlayer.posX === 0
                ? new ButtonBuilder().setCustomId("#flee").setLabel("Flee").setStyle(ButtonStyle.Danger).setDisabled(allowActionsButtons)
                : new ButtonBuilder().setCustomId("#moveLeft").setLabel("<<<").setStyle(ButtonStyle.Primary).setDisabled(allowActionsButtons),
            new ButtonBuilder().setCustomId("#attack").setLabel("Attack").setStyle(ButtonStyle.Primary).setDisabled(allowActionsButtons),
            nextPlayer.posX === this.arenaSize - 1
                ? new ButtonBuilder().setCustomId("#flee").setLabel("Flee").setStyle(ButtonStyle.Danger).setDisabled(allowActionsButtons)
                : new ButtonBuilder().setCustomId("#moveRight").setLabel(">>>").setStyle(ButtonStyle.Primary).setDisabled(allowActionsButtons),
            new ButtonBuilder().setCustomId("#sleep").setLabel("sleep").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("#end").setLabel("End Fight (TEST)").setStyle(ButtonStyle.Primary),
        );

        return {
            embeds: [builder],
            files: [fieldImageAttachment],
            components: [actionRow],
        };
    }

    getCurrentPlayer(): Fighter {
        return this.appUsers[this.playerTurn]!.fighter;
    }
    getNextPlayer(): Fighter {
        return this.appUsers[this.playerTurn === 0 ? 1 : 0]!.fighter;
    }
}
