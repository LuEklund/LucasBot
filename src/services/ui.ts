import { AppButton, AppModal } from "@/ui";
import { Service } from "@/service";
import { Client, Events, type Interaction } from "discord.js";

export default class ButtonService extends Service.Base {
    override async start(client: Client): Promise<void> {
        client.on(Events.InteractionCreate, this.handleButton);
        client.on(Events.InteractionCreate, this.handleModal);
    }

    override async stop(client: Client): Promise<void> {
        client.off(Events.InteractionCreate, this.handleButton);
        client.off(Events.InteractionCreate, this.handleModal);
    }

    private handleButton = async (interaction: Interaction) => {
        if (!interaction.isButton()) return;
        const button = AppButton.buttons.get(interaction.customId);
        if (button) button.onPress(interaction);
        else interaction.reply({ content: "This button is not active", flags: "Ephemeral" });
        console.log(
            `${new Date().toISOString()} ${interaction.user.displayName} pressed button ${button ? (button.builder.data as any).label : "unknown"}`,
        );
    };

    private handleModal = async (interaction: Interaction) => {
        if (!interaction.isModalSubmit()) return;
        const modal = AppModal.modals.get(interaction.customId);
        if (modal) modal.onOpen(modal, interaction);
        else interaction.reply({ content: "This button is not active", flags: "Ephemeral" });
        console.log(`${new Date().toISOString()} ${interaction.user.displayName} opened modal ${(modal!.builder.data as any).title}`);
    };
}
