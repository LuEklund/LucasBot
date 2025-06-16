import { Service } from "@/service";
import { Client, type EmojiIdentifierResolvable, Events, Message } from "discord.js";

const GOOD_USER_ID = "402859016457420820";
const BAD_USER_ID = "924027166096752650";
const THUMBS_UP: EmojiIdentifierResolvable = "👍";
const THUMBS_DOWN: EmojiIdentifierResolvable = "👎";

export default class MessageResponderService extends Service.Base {
    override async start(client: Client): Promise<void> {
        client.on(Events.MessageCreate, this.handleMessage);
    }

    override async stop(client: Client): Promise<void> {
        client.off(Events.MessageCreate, this.handleMessage);
    }

    private handleMessage = async (msg: Message): Promise<void> => {
        if (msg.author.bot) return;

        try {
            if (msg.author.id === GOOD_USER_ID) {
                await msg.react(THUMBS_UP);
            } else if (msg.author.id === BAD_USER_ID) {
                await msg.react(THUMBS_DOWN);
            }
        } catch (err) {
            console.error(err, "Failed to add reaction.");
        }
    };
}
