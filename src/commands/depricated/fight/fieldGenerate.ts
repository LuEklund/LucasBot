import type Fighter from "@/commands/Fight/fighter";
import type FightGame from "@/commands/Fight/fightGame";
import type { AppUser } from "@/user";
import { createCanvas, Image, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";

export const BLOCK_SIZE = 64;

async function addPlayerToConext(appUser: AppUser, context: SKRSContext2D, BorderImage: Image | undefined) {
    const playerAvatarUrl = appUser.discord.avatarURL()!;
    const player: Fighter = appUser.fighter;
    let playerAvatar;
    try {
        playerAvatar = await loadImage(playerAvatarUrl);
        context.drawImage(playerAvatar, player.posX * BLOCK_SIZE, 0, BLOCK_SIZE, BLOCK_SIZE);
        if (BorderImage !== undefined) {
            context.drawImage(BorderImage, player.posX * BLOCK_SIZE, 0, BLOCK_SIZE, BLOCK_SIZE);
        }
    } catch (error) {
        console.error(`Failed to load player 1 avatar from ${playerAvatarUrl}:`, error);
        context.fillStyle = "red";
        context.fillRect(player.posX * BLOCK_SIZE, 0, BLOCK_SIZE, BLOCK_SIZE);
        context.font = `${BLOCK_SIZE / 8}px sans-serif`;
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(appUser.database.username, player.posX * BLOCK_SIZE + BLOCK_SIZE / 2, BLOCK_SIZE / 2);
    }
}

export async function getFieldImage(currentGame: FightGame) {
    const FIELD_HEIGHT = BLOCK_SIZE;
    const FIELD_WIDTH = currentGame.arenaSize * BLOCK_SIZE;

    const canvas = createCanvas(FIELD_WIDTH, FIELD_HEIGHT);
    const context = canvas.getContext("2d");
    const squareBlockImagePath = "./assets/square.png";
    const borderImagePath = "./assets/border.png";

    let defaultBlockImage;
    try {
        defaultBlockImage = await loadImage(squareBlockImagePath);
    } catch (error) {
        console.error(`Failed to load square block image from ${squareBlockImagePath}:`, error);
        context.fillStyle = "#CCCCCC";
    }

    let BorderImage;
    try {
        BorderImage = await loadImage(borderImagePath);
    } catch (error) {
        console.error(`Failed to load square block image from ${borderImagePath}:`, error);
        context.fillStyle = "#BBBBBB";
    }

    for (let i = 0; i < currentGame.arenaSize; i++) {
        const x = i * BLOCK_SIZE;
        if (defaultBlockImage) {
            context.drawImage(defaultBlockImage, x, 0, BLOCK_SIZE, BLOCK_SIZE);
        } else {
            context.fillRect(x, 0, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    const players: AppUser[] = currentGame.appUsers;
    await addPlayerToConext(players[0]!, context, currentGame.playerTurn === 1 ? BorderImage! : undefined);
    await addPlayerToConext(players[1]!, context, currentGame.playerTurn === 0 ? BorderImage! : undefined);
    const buffer = await canvas.encode("png");
    const attachment = new AttachmentBuilder(buffer, {
        name: "game-field.png",
    });
    return attachment;
}
