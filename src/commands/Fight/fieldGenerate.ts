import type Fighter from "@/commands/Fight/fighter";
import type FightGame from "@/commands/Fight/fightGame";
import { Globals } from "@/index";
import { Item } from "@/models/item";
import { UserDB } from "@/models/user";
import type { AppUser } from "@/user";
import { createCanvas, GlobalFonts, Image, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import { AttachmentBuilder, EmbedBuilder, type InteractionUpdateOptions } from "discord.js";

export const BLOCK_WIDTH = 64;
export const BLOCK_HEIGHT = 128;

export type PlayerAction =
    | { type: "attack"; damageTaken?: number }
    | { type: "move" }
    | { type: "sleep"; healthRegained?: number; manaRegained?: number }
    | { type: "escape"; escaped: boolean }
    | { type: "none" };

async function addPlayerToConext(appUser: AppUser, context: SKRSContext2D, BorderImage: Image | undefined, isOtherSide: boolean) {
    const pfpSize = BLOCK_WIDTH / 4;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    context.strokeStyle = "#000000";
    context.font = ${pfpSize}px Bangers;
    context.lineWidth = 1;
    const playerAvatarUrl = appUser.discord.displayAvatarURL({
        extension: "png",
        size: BLOCK_WIDTH / 4,
    });

    const player: Fighter = appUser.fighter;

    const gladiatorBody = "./assets/Gladiator.png";
    const gladiatorDeadBody = "./assets/GladiatorDead.png";
    try {
        let gladiatorImg = undefined;
        if (player.currentHealth <= 0) {
            gladiatorImg = await loadImage(gladiatorDeadBody);
            context.drawImage(gladiatorImg, player.posX * BLOCK_WIDTH, BLOCK_HEIGHT / 2, BLOCK_HEIGHT, BLOCK_WIDTH);
        } else {
            gladiatorImg = await loadImage(gladiatorBody);
            context.drawImage(gladiatorImg, player.posX * BLOCK_WIDTH, 0, BLOCK_WIDTH, BLOCK_HEIGHT);
        }
    } catch (error) {
        console.log("Failed to load gladiator image");
    }

    let playerAvatar;
    let pfpImagePosXStart = player.posX * BLOCK_WIDTH;
    pfpImagePosXStart = isOtherSide ? pfpImagePosXStart + BLOCK_WIDTH - pfpSize : pfpImagePosXStart;
    try {
        playerAvatar = await loadImage(playerAvatarUrl);
        context.drawImage(playerAvatar, pfpImagePosXStart, 0, pfpSize, pfpSize);
        if (BorderImage !== undefined) {
            context.drawImage(BorderImage, pfpImagePosXStart, 0, pfpSize, pfpSize);
        }
    } catch (error) {
        console.error(Failed to load player avatar from ${playerAvatarUrl}:, error);
        context.fillText(appUser.database.username, pfpImagePosXStart + pfpSize / 2, pfpSize / 2);
        context.strokeText(appUser.database.username, pfpImagePosXStart + pfpSize / 2, pfpSize / 2);
    }
}

async function addImageToContext(context: SKRSContext2D, pathToImage: string, startX: number, startY: number, wdith: number, height: number) {
    try {
        let img = await loadImage(pathToImage);
        context.drawImage(img, startX, startY, wdith, height);
    } catch (error) {
        console.log("Failed to load image");
    }
}

function addTextToContext(context: SKRSContext2D, text: string, startX: number, startY: number) {
    context.fillText(text, startX, startY);
    context.strokeText(text, startX, startY);
}

function getPosSign(num: number) {
    return num > 0 ? "+" : "";
}

async function addAction(context: SKRSContext2D, currentGame: FightGame, action: PlayerAction) {
    context.font = 30px Bangers;
    const attackedPlayer = currentGame.getNextPlayer();

    const currentPlayer = currentGame.getCurrentPlayer();

    switch (action.type) {
        case "attack":
            if (!action.damageTaken || action.damageTaken == 0) {
                await addImageToContext(context, "./assets/block.png", attackedPlayer.posX * BLOCK_WIDTH, BLOCK_HEIGHT / 5, BLOCK_WIDTH, BLOCK_WIDTH);
                await addImageToContext(
                    context,
                    "./assets/mana.png",
                    currentPlayer.posX * BLOCK_WIDTH,
                    BLOCK_HEIGHT / 2,
                    BLOCK_WIDTH / 2,
                    BLOCK_WIDTH / 2,
                );
                addTextToContext(context, -1, currentPlayer.posX * BLOCK_WIDTH + BLOCK_WIDTH / 4, BLOCK_HEIGHT / 2 + BLOCK_HEIGHT / 8);
            } else {
                await addImageToContext(
                    context,
                    "./assets/hearth.png",
                    attackedPlayer.posX * BLOCK_WIDTH,
                    BLOCK_HEIGHT / 5,
                    BLOCK_WIDTH / 2,
                    BLOCK_WIDTH / 2,
                );
                addTextToContext(
                    context,
                    action.damageTaken.toFixed(1),
                    attackedPlayer.posX * BLOCK_WIDTH + BLOCK_WIDTH / 4,
                    BLOCK_HEIGHT / 5 + BLOCK_HEIGHT / 10,
                );
                await addImageToContext(
                    context,
                    "./assets/mana.png",
                    currentPlayer.posX * BLOCK_WIDTH,
                    BLOCK_HEIGHT / 2,
                    BLOCK_WIDTH / 2,
                    BLOCK_WIDTH / 2,
                );
                addTextToContext(context, -1, currentPlayer.posX * BLOCK_WIDTH + BLOCK_WIDTH / 4, BLOCK_HEIGHT / 2 + BLOCK_HEIGHT / 8);
            }

            break;
        case "sleep":
            await addImageToContext(
                context,
                "./assets/hearth.png",
                currentPlayer.posX * BLOCK_WIDTH,
                BLOCK_HEIGHT / 5,
                BLOCK_WIDTH / 2,
                BLOCK_WIDTH / 2,
            );
            addTextToContext(
                context,
                +${action.healthRegained?.toFixed(1)},
                currentPlayer.posX * BLOCK_WIDTH + BLOCK_WIDTH / 4,
                BLOCK_HEIGHT / 5 + BLOCK_HEIGHT / 10,
            );
            await addImageToContext(
                context,
                "./assets/mana.png",
                currentPlayer.posX * BLOCK_WIDTH,
                BLOCK_HEIGHT / 2,
                BLOCK_WIDTH / 2,
                BLOCK_WIDTH / 2,
            );
            addTextToContext(
                context,
                +${action.manaRegained?.toFixed(1)},
                currentPlayer.posX * BLOCK_WIDTH + BLOCK_WIDTH / 4,
                BLOCK_HEIGHT / 2 + BLOCK_HEIGHT / 8,
            );

            break;
        case "move":
            await addImageToContext(
                context,
                "./assets/mana.png",
                currentPlayer.posX * BLOCK_WIDTH,
                BLOCK_HEIGHT / 2,
                BLOCK_WIDTH / 2,
                BLOCK_WIDTH / 2,
            );
            addTextToContext(context, -1, currentPlayer.posX * BLOCK_WIDTH + BLOCK_WIDTH / 4, BLOCK_HEIGHT / 2 + BLOCK_HEIGHT / 8);
            break;
        case "escape":
            await addImageToContext(context, "./assets/escape.png", currentPlayer.posX * BLOCK_WIDTH, BLOCK_HEIGHT / 2, BLOCK_WIDTH, BLOCK_WIDTH);
            break;
    }
}

export async function getFieldImage(currentGame: FightGame, action: PlayerAction) {
    const FIELD_WIDTH = currentGame.arenaSize * BLOCK_WIDTH;

    const canvas = createCanvas(FIELD_WIDTH, BLOCK_HEIGHT);
    const context = canvas.getContext("2d");
    const squareBlockImagePath = "./assets/SAS-Background.png";
    const borderImagePath = "./assets/border.png";

    let defaultBlockImage;
    try {
        defaultBlockImage = await loadImage(squareBlockImagePath);
    } catch (error) {
        console.error(Failed to load square block image from ${squareBlockImagePath}:, error);
        context.fillStyle = "#CCCCCC";
    }

    let BorderImage;
    try {
        BorderImage = await loadImage(borderImagePath);
    } catch (error) {
        console.error(Failed to load square block image from ${borderImagePath}:, error);
        context.fillStyle = "#BBBBBB";
    }

    for (let i = 0; i < currentGame.arenaSize; i++) {
        const x = i * BLOCK_WIDTH;
        if (defaultBlockImage) {
            context.drawImage(defaultBlockImage, x, 0, BLOCK_WIDTH, BLOCK_HEIGHT);
        } else {
            context.fillRect(x, 0, BLOCK_WIDTH, BLOCK_HEIGHT);
        }
    }
    const players: AppUser[] = currentGame.appUsers;
    await addPlayerToConext(players[0]!, context, currentGame.playerTurn === 1 ? BorderImage! : undefined, false);
    await addPlayerToConext(players[1]!, context, currentGame.playerTurn === 0 ? BorderImage! : undefined, true);
    await addAction(context, currentGame, action);
    const buffer = await canvas.encode("png");
    const attachment = new AttachmentBuilder(buffer, {
        name: "game-field.png",
    });
    return attachment;
}

export async function createStatBar(current: number, max: number, length: number = 10, filledColorCode: string = "31"): Promise<string> {
    if (max <= 0) return ":no_entry_sign: ";
    const percentage = current / max;
    const filled = Math.round(length * percentage);
    const empty = length - filled;
    const filledBar = "█".repeat(filled);
    const emptyBar = " ".repeat(empty);
    // Using ANSI code block for better visual consistency of the bar
    return ${current.toFixed(2)}/${max.toFixed(2)}\\\ansi\n[2;${filledColorCode}m${filledBar}[0m[2;37m${emptyBar}[0m\n\\\ ;
}

export async function getItemDisplay(player: Fighter) {
    const playerEquippedItems: string[] = (await player.appUser.getEquippedItems()).map(([_, name]) => name);
    const items: Item.Base[] = Item.manager.findManyByNames(playerEquippedItems);

    // Group by item name
    const grouped: Record<string, { item: Item.Base; count: number }> = {};

    for (const item of items)
        if (!grouped[item.name]) grouped[item.name] = { item, count: 1 };
        else grouped[item.name]!.count++;

    let itemsDisplay = "";

    for (const { item, count } of Object.values(grouped)) {
        const flatModifiers = Object.entries(item.flatModifiers ?? {})
            .filter(([k, v]) => v !== 0 && Globals.ATTRIBUTES[k as keyof typeof Globals.ATTRIBUTES])
            .map(([k, v]) => ${Globals.ATTRIBUTES[k as keyof typeof Globals.ATTRIBUTES].emoji} ${v > 0 ? "+" : ""}${v})
            .join(", ");

        const percentageModifiers = Object.entries(item.percentageModifiers ?? {})
            .filter(([k, v]) => v !== 0 && Globals.ATTRIBUTES[k as keyof typeof Globals.ATTRIBUTES])
            .map(([k, v]) => ${Globals.ATTRIBUTES[k as keyof typeof Globals.ATTRIBUTES].emoji} ${v > 0 ? "+" : ""}${v * 100}%)
            .join(", ");

        const modifiers = [flatModifiers, percentageModifiers].filter(Boolean).join("\n");

        itemsDisplay += **${count > 1 ? x${count}  : ""}${item.name}**\nType: ${item.type ?? "???"}${modifiers ? \n${modifiers} : ""}\n\n;
    }

    return {
        name: ${player.appUser.discord.displayName}'s Items,
        value: 📦 Items: \n${itemsDisplay.trim() || "None"}\n,
        inline: true,
    };
}

export async function getStatsDisplay(player: Fighter) {
    const statsData = UserDB.StatDB.keys.map((key) => ({
        name: Globals.ATTRIBUTES[key].name,
        emoji: Globals.ATTRIBUTES[key].emoji,
        value: player.appUser.database.stats[key],
    }));

    const maxNameLength = Math.max(...statsData.map((stat) => stat.name.length));

    const statString = statsData
        .map((stat) => {
            const padded = stat.name.padEnd(maxNameLength, " ");
            return ${stat.emoji} ${padded}: ${stat.value} + ${(player.appUser.getStat(stat.name.toLowerCase() as UserDB.StatDB.Type) - stat.value).toFixed(2)};
        })
        .join("\n");

    return {
        name: ${player.appUser.discord.displayName}'s Stats,
        value: statString + "\n\n\n",
        inline: true,
    };
}

export async function getFightDisplay(currentGame: FightGame, action: PlayerAction): Promise<InteractionUpdateOptions> {
    const currentPlayer = currentGame.getCurrentPlayer();
    const nextPlayer = currentGame.getNextPlayer();
    const player1 = currentGame.appUsers[0]!.fighter;
    const player2 = currentGame.appUsers[1]!.fighter;
    const player1HealthBar = await createStatBar(player1.currentHealth, player1.getMaxHealthStats(), player1.getMaxHealthStats(), "31");
    const player1ManaBar = await createStatBar(player1.currentMana, player1.getMaxManaStats(), player1.getMaxManaStats(), "34");
    const player2HealthBar = await createStatBar(player2.currentHealth, player2.getMaxHealthStats(), player2.getMaxHealthStats(), "31");
    const player2ManaBar = await createStatBar(player2.currentMana, player2.getMaxManaStats(), player2.getMaxManaStats(), "34");
    // const player1ItemDisplay = await getItemDisplay(player1);
    // const player2ItemDisplay = await getItemDisplay(player2);
    const player1StatsDisplay = await getStatsDisplay(player1);
    const player2StatsDisplay = await getStatsDisplay(player2);
    const fieldImageAttachment = await getFieldImage(currentGame, action);
    const builder = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({
            name: It's ${nextPlayer.appUser.discord.displayName}'s Turn!,
            iconURL: nextPlayer.appUser.discord.avatarURL()!,
        })
        .setImage("attachment://game-field.png")
        // .addFields(player1ItemDisplay, { name: "\u200B", value: "\u200B", inline: true }, player2ItemDisplay)
        .addFields(player1StatsDisplay, { name: "\u200B", value: "\u200B", inline: true }, player2StatsDisplay)
        .addFields(
            {
                name: "Health",
                value: player1HealthBar,
                inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: true },
            {
                name: "Health",
                value: player2HealthBar,
                inline: true,
            },
        )
        .addFields(
            {
                name: "Mana",
                value: player1ManaBar,
                inline: true,
            },
            { name: "\u200B", value: "\u200B", inline: true },
            {
                name: "Mana",
                value: player2ManaBar,
                inline: true,
            },
        )
        .setFooter({
            text: ➡️ It's ${nextPlayer.appUser.discord.displayName}'s Turn!,
            iconURL: nextPlayer.appUser.discord.avatarURL()!,
        })
        .setTimestamp();

    return {
        embeds: [builder],
        files: [fieldImageAttachment],
    };
}
