import MessageResponderService from "./messageResponder";
import TimeoutService from "./timeout";

export class BotServices {
    public messageResponderService: MessageResponderService;
    public timeoutTrackingService: TimeoutService;
    private client: any;
    private logger: any;

    constructor(client: any, logger: any) {
        this.client = client;
        this.logger = logger;
        this.messageResponderService = new MessageResponderService();
        this.timeoutTrackingService = new TimeoutService();
    }

    start() {
        this.logger.info("Bot Services starting.");
        this.messageResponderService.start(this.client);
        this.timeoutTrackingService.start(this.client);
    }

    stop() {
        this.logger.info("Bot Services stopped.");
        this.messageResponderService.stop(this.client);
        this.timeoutTrackingService.stop(this.client);
    }
}

export default BotServices;
