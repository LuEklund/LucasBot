import { ModalSubmitInteraction } from "discord.js";
import { AppModal, type AppModalField } from "../../ui";
import { Globals } from "../..";
import { AppUser } from "@/user";
import { Profession } from "../work";

export default class CProgrammerProfession extends Profession {
    // prettier-ignore
    static questions: [string, string][] = [
        [
`#include <stdio.h>

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};

    for (int i = 0; i <= 5; i++) {
        printf("Number: %d", numbers[i]);
    }

    return 0;
}`, 

`#include <stdio.h>

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};

    for (int i = 0; i < 5; i++) {
        printf("Number: %d", numbers[i]);
    }

    return 0;
}`,
        ],

        [
`#include <stdlib.h>

int main() {
    int* ptr;
    ptr = 10;
    free(ptr);
    return 0;
}`,

`#include <stdlib.h>

int main() {
    int* ptr = malloc(sizeof(int));
    *ptr = 10;
    free(ptr);
    return 0;
}
`,
        ],

        [
`#include <stdio.h>

int main() {
    char str[5];
    strcpy(str, "Hello, world!");
    printf("%s", str);
    return 0;
}
`,

`#include <stdio.h>
#include <string.h>

int main() {
    char str[14];
    strcpy(str, "Hello, world!");
    printf("%s", str);
    return 0;
}`,
        ],

        [
`#pragma once;

void wow()`,

`#pragma once

void wow()`,
        ],
    ];

    constructor() {
        let questions: [string, string][] = [];
        let fields: AppModalField[] = [];

        const randomQuestions = CProgrammerProfession.questions.sort(() => Math.random() - 0.5);

        randomQuestions.forEach((question, i) => {
            questions.push(question);

            fields.push({
                name: `#${i + 1}`,
                value: question[0],
                style: "Paragraph",
            });
        });

        const modal = new AppModal(
            "Fix all the issues and make the code clean and nice!".split(0, 45),
            fields,
            async (modal: AppModal, interaction: ModalSubmitInteraction) => {
                let solvedCount: number = 0;

                for (let i: number = 0; i < randomQuestions.length; i++) {
                    const answer = modal.getField(interaction, `#${i + 1}`);
                    const question = (randomQuestions[i] ?? ["", ""])[1];
                    if (answer === question) solvedCount++;
                }

                const user = await AppUser.fromID(interaction.user.id);
                const reward = solvedCount * Math.max(0, user.getStat("charisma") - 5) + user.getStat("magicka") / 2;
                await user.addGold(reward).save();

                await interaction.reply({
                    content: `You solved ${solvedCount}/${[...modal.fields.values()].length} c coding problems\n+${reward.toFixed(2)} ${Globals.ATTRIBUTES.gold.emoji}`,
                    flags: "Ephemeral",
                });
            },
        );

        super(modal);
    }
}
