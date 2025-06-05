import { Client } from "discord.js";
import { MessageResponderService } from "@/services/messageResponderService.ts";
import { TimeoutService } from "@/services/timeoutService";

export interface ILogger {
    info(message: string): void;
    error(error: unknown, message?: string): void;
}
export class BotServices {
    private readonly messageResponderService: MessageResponderService;
    private readonly timeoutTrackingService: TimeoutService;

    constructor(
        client: Client,
        private readonly logger: ILogger = console, // default to console
    ) {
        this.messageResponderService = new MessageResponderService(
            client,
            logger,
        );
        this.timeoutTrackingService = new TimeoutService(client, logger);
    }

    start(): void {
        this.logger.info("Bot Services starting.");
        this.messageResponderService.start();
        this.timeoutTrackingService.start();
    }

    stop(): void {
        this.messageResponderService.stop();
        this.timeoutTrackingService.stop();
        this.logger.info("Bot Services stopped.");
    }
}
