import { AppButton } from "@/button";
import { Service } from "@/service";
import { Client, Events, type Interaction } from "discord.js";

export default class ButtonService extends Service.Base {
    override async start(client: Client): Promise<void> {
        client.on(Events.InteractionCreate, this.handleButton);
    }

    override async stop(client: Client): Promise<void> {
        client.off(Events.InteractionCreate, this.handleButton);
    }

    private handleButton = async (interaction: Interaction) => {
        if (!interaction.isButton()) return;
        const button = AppButton.buttons.get(interaction.customId);
        button!.onPress(interaction);
        console.log(button!.builder.data.label);
    };
}
