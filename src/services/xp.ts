import { Service } from "@/service";
import { AppUser } from "@/user";
import {
    Client,
    Events,
    Message,
    type PartialMessage,
    MessageReaction,
    type PartialMessageReaction,
    User,
    type PartialUser,
    type Snowflake,
} from "discord.js";

export default class XpService extends Service.Base {
    override async start(client: Client): Promise<void> {
        client.on(Events.MessageCreate, this.handleMessageCreate);
        client.on(Events.MessageDelete, this.handleMessageDelete);
        client.on(Events.MessageReactionAdd, this.handleReactionAdd);
        client.on(Events.MessageReactionRemove, this.handleReactionRemove);
    }

    override async stop(client: Client): Promise<void> {
        client.off(Events.MessageCreate, this.handleMessageCreate);
        client.off(Events.MessageDelete, this.handleMessageDelete);
        client.off(Events.MessageReactionAdd, this.handleReactionAdd);
        client.off(Events.MessageReactionRemove, this.handleReactionRemove);
    }

    private handleMessageCreate = async (message: Message) => {
        if (message.author.bot) return;

        this.rewardXp(message.author, 2);
    };

    private handleMessageDelete = async (message: Message | PartialMessage | Snowflake) => {
        if (typeof message === "string") {
            console.log("Only message ID received, cannot get author directly.");
            return;
        }

        if (message.partial) {
            try {
                await message.fetch();
            } catch {
                console.log("Could not fetch deleted message details.");
                return;
            }
        }

        const author = message.author;
        if (!author || author.bot) return;

        console.log("Deleted message author:", author.tag);
        await this.rewardXp(author, -2);
    };

    private handleReactionAdd = async (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser,
    ): Promise<void> => {
        this.rewardXp(reaction.message.author!, 1);
        this.rewardXp(user, 1);
    };

    private handleReactionRemove = async (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser,
    ): Promise<void> => {
        this.rewardXp(user, -1);
    };

    private async rewardXp(user: User | PartialUser, xp: number) {
        if (!user) return; //TODO: valid solution right?
        const appUser = await AppUser.fromID(user.id);
        const currentTime = new Date();
        const timeDifferenceMs = currentTime.getTime() - appUser.database.lastXpMessageAt.getTime();
        const timeDifferenceMinutes = timeDifferenceMs / (1000 * 3);
        if (timeDifferenceMinutes >= 1) {
            appUser.database.lastXpMessageAt = currentTime;
            await appUser.addXP(xp).save();
        }
    }
}
