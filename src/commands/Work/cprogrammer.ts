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
`#ifndef WOW_H
#define WOW_H

void wow()

#endif`,

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

        const modal = new AppModal("C Internship, fix all the issues", fields, async (interaction: ModalSubmitInteraction) => {
            let solvedCount: number = 0;

            for (let i: number = 0; i < randomQuestions.length; i++) {
                const answer = interaction.fields.getField(`#${i + 1}`).value as string;
                const question = randomQuestions[i] ?? "";
                if (String(answer).trim() === String(question[1]).trim()) solvedCount++;
            }

            const user = await AppUser.fromID(interaction.user.id);
            const reward = solvedCount * Math.max(0, user.getStat("charisma") - 5) + user.getStat("magicka") / 2;
            await user.addGold(reward).save();

            await interaction.reply({
                content: `You solved ${solvedCount}/${modal.fields.length} c coding problems\n+${reward.toFixed(2)} ${Globals.ATTRIBUTES.gold.emoji}`,
                flags: "Ephemeral",
            });
        });

        super(modal);
    }
}
