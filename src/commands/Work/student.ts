import { ModalSubmitInteraction } from "discord.js";
import { AppModal, type AppModalField } from "../../ui";
import { Globals } from "../..";
import { AppUser } from "@/user";
import { Profession } from "../work";

export default class StudentProfession extends Profession {
    static questions: [string, string][] = [
        ["1+1", "2"],
        ["3*4", "12"],
        ["5-2", "3"],
        ["10/2", "5"],
        ["2^3", "8"],
        ["7+6", "13"],
        ["9-5", "4"],
        ["6*7", "42"],
        ["100/25", "4"],
        ["8+2*3", "14"],
        ["(8+2)*3", "30"],
        ["15%4", "3"],
        ["3*2", "6"],
        ["9+10", "19"],
        ["14-7", "7"],
        ["0*100", "0"],
    ];

    constructor() {
        let questions: [string, string][] = [];
        let fields: AppModalField[] = [];

        const randomQuestions = StudentProfession.questions.sort(() => Math.random() - 0.5).slice(0, 5);

        randomQuestions.forEach((question, i) => {
            questions.push(question);

            fields.push({
                name: `${question[0]}`,
                style: "Short",
                placeholder: "Don't you dare use a calculator",
                required: false,
            });
        });

        const modal = new AppModal("C Internship, fix all the issues", fields, async (modal: AppModal, interaction: ModalSubmitInteraction) => {
            let solvedCount: number = 0;

            for (let i: number = 0; i < randomQuestions.length; i++) {
                const answer = modal.getField(interaction, randomQuestions[i]?.[0] || "");
                const question: string = (randomQuestions[i] ?? ["", ""])[1];
                console.log(`A: ${answer.toString()} Q: ${question.toString()}`);

                if (answer === question) solvedCount++;
            }

            const user = await AppUser.fromID(interaction.user.id);
            const reward = solvedCount * Math.max(0, user.getStat("charisma") - 5) + user.getStat("magicka") / 3;
            await user.addGold(reward).save();

            await interaction.reply({
                content: `You solved ${solvedCount}/${[...modal.fields.values()].length} math problems\n+${reward.toFixed(2)} ${Globals.ATTRIBUTES.gold.emoji}`,
                flags: "Ephemeral",
            });
        });

        super(modal);
    }
}
