import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
    type ModalActionRowComponentBuilder,
    type ModalActionRowComponent,
    TextInputComponent,
} from "discord.js";

export class AppButton {
    id: string;
    builder: ButtonBuilder;
    onPress: (interaction: ButtonInteraction) => void;

    static buttons: Map<string, AppButton> = new Map();

    constructor(label: string, onPress: (interaction: ButtonInteraction) => void, style: ButtonStyle = ButtonStyle.Primary) {
        this.onPress = onPress;
        const randomId = Math.random();
        this.id = `#b${randomId.toString()}`;

        this.builder = new ButtonBuilder().setCustomId(this.id).setLabel(label).setStyle(style);

        AppButton.buttons.set(this.id, this);
    }

    static createActionRow(buttons: AppButton[], perLine: number = 5): ActionRowBuilder<ButtonBuilder>[] {
        const selectedButtons = Array.from(buttons).filter((btn): btn is AppButton => btn !== undefined);

        if (selectedButtons.length === 0) console.warn(`You must select between 1 and 25 buttons, found: ${selectedButtons.length}`);
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

export interface AppModalField {
    name: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    style?: "Short" | "Paragraph";
    minLength?: number;
    maxLength?: number;
}

export class AppModal {
    id: string;
    builder: ModalBuilder;
    fields: Map<string, string> = new Map();
    onOpen: (modal: AppModal, interaction: ModalSubmitInteraction) => void;

    static modals: Map<string, AppModal> = new Map();

    constructor(title: string, fields: AppModalField[], onOpen: (modal: AppModal, interaction: ModalSubmitInteraction) => void) {
        this.onOpen = onOpen;
        this.id = `#m${Math.random().toString()}`;

        let rows: ActionRowBuilder[] = [];

        fields.forEach((field) => {
            const id = `#mt${Math.random().toString()}`;
            const textInput = new TextInputBuilder()
                .setCustomId(id)
                .setLabel(field.name)
                .setValue(field.value || "")
                .setPlaceholder(field.placeholder || "")
                .setRequired(field.required)
                .setStyle(TextInputStyle[field.style || ("Short" as keyof typeof TextInputStyle)])
                .setMinLength(field.minLength || 0)
                .setMaxLength(field.maxLength || 4000);

            this.fields.set(field.name, id);
            rows.push(new ActionRowBuilder().addComponents(textInput));
        });

        this.builder = new ModalBuilder()
            .setCustomId(this.id)
            .setTitle(title)
            .addComponents(rows as any);

        AppModal.modals.set(this.id, this);
    }

    getField(interaction: ModalSubmitInteraction, name: string): string {
        return interaction.fields.getField(this.fields.get(name) || "").value as string;
    }
}
