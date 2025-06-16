import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";

export class AppButton {
    id: string;
    builder: ButtonBuilder;
    onPress: (interaction: ButtonInteraction) => void;

    static buttons: Map<string, AppButton> = new Map();

    constructor(
        label: string,
        onPress: (interaction: ButtonInteraction) => void,
        style: ButtonStyle = ButtonStyle.Primary,
    ) {
        this.onPress = onPress;
        const randomId = Math.random();
        this.id = `#${randomId.toString()}`;

        this.builder = new ButtonBuilder().setCustomId(this.id).setLabel(label).setStyle(style);

        AppButton.buttons.set(this.id, this);
    }

    static createActionRow(buttons: AppButton[], perLine: number = 5): ActionRowBuilder<ButtonBuilder>[] {
        const selectedButtons = Array.from(buttons).filter((btn): btn is AppButton => btn !== undefined);

        if (selectedButtons.length === 0)
            console.warn(`You must select between 1 and 25 buttons, found: ${selectedButtons.length}`);
        if (perLine < 1 || perLine > 5) throw new Error(`Per line must be between 1 and 5, found ${perLine}`);

        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        for (let i = 0; i < selectedButtons.length; i += perLine) {
            const chunk = selectedButtons.slice(i, i + perLine);
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...chunk.map((btn) => btn.builder));
            rows.push(row);
        }

        return rows;
    }
}
