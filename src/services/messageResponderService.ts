import {
    Client,
    type EmojiIdentifierResolvable,
    Events,
    Message,
} from "discord.js";

export interface ILogger {
    info(message: string): void;
    error(error: unknown, message?: string): void;
}

const GOOD_USER_ID = "402859016457420820";
const BAD_USER_ID = "924027166096752650";
const THUMBS_UP: EmojiIdentifierResolvable = "👍";
const THUMBS_DOWN: EmojiIdentifierResolvable = "👎";

export class MessageResponderService {
    constructor(
        private readonly client: Client,
        private readonly logger: ILogger = console,
    ) {}

    start(): void {
        this.logger.info("Message Responder Service starting.");
        this.client.on(Events.MessageCreate, this.handleMessage);
    }

    stop(): void {
        this.client.off(Events.MessageCreate, this.handleMessage);
        this.logger.info("Message Responder Service stopped.");
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
            this.logger.error(err, "Failed to add reaction.");
        }
    };
}
