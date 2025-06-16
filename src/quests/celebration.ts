import { Message, EmbedBuilder } from "discord.js";
import { Quest } from "@/quest";
import { AppButton } from "@/button";
import { AppUser } from "@/user";
import { Globals } from "..";

export interface Celebration {
    title: string;
    descrition: string;
    image: string;
}

export default class CelebrationQuest extends Quest.Base {
    public override buttons: AppButton[] = [];
    override maxTimeActiveMS = 0;
    goldReward: number = 5;

    celebrations: Celebration[] = [
        {
            title: "Lucas Party",
            descrition: `No party like a Lucas party\nEveryone gains ${this.goldReward}${Globals.ATTRIBUTES.gold.emoji}`,
            image: "https://cdn.discordapp.com/attachments/1379101132743250082/1381989461734461572/party.png?ex=6849857b&is=684833fb&hm=fc43bbf72ac8d6f738251d7b2171851e0db2f7b00eb06ae5f46e9320fb4f77f6&",
        },
        {
            title: "Ribbits Birthday",
            descrition: `Ribbit is now becoming 5 years old!\nAll recived ${this.goldReward}${Globals.ATTRIBUTES.gold.emoji}`,
            image: "https://cdn.discordapp.com/attachments/1379101132743250082/1383431011114946662/iu.png?ex=684ec407&is=684d7287&hm=af07cf7e6b2a6ea894673efc36b9f814828878e4c7ef7caa6020c97adb941b83&",
        },
        {
            title: "Zig Zelebration",
            descrition: ` new future Zig enjoyer was allocated on the heap!\nEveryone got ${this.goldReward}${Globals.ATTRIBUTES.gold.emoji}`,
            image: "https://cdn.discordapp.com/attachments/1379101132743250082/1383431991780970650/Zw.png?ex=684ec4f1&is=684d7371&hm=d1ddb8139591189b0af5024e4df23f10253f4a32e9922265d5746ccf75b81a45&",
        },
    ];

    public override async start(): Promise<Message<true>> {
        const randomIndex = Math.floor(Math.random() * this.celebrations.length);
        const celebration = this.celebrations[randomIndex];
        if (!celebration) {
            const msg = `Failed to get random celebration: ${randomIndex}`;
            console.warn(msg);
            return await Globals.CHANNEL.send(msg);
        }

        const embed = new EmbedBuilder()
            .setTitle(celebration.title)
            .setDescription(celebration.descrition)
            .setColor("#e63946")
            .setImage(celebration.image)
            .setURL(Globals.LINK);

        this.goldReward = Math.floor(Math.random() * 5);

        (await Globals.CHANNEL.guild.members.fetch()).forEach(async (member) =>
            (await AppUser.fromID(member.id)).addGold(this.goldReward).save(),
        );

        return await Globals.CHANNEL.send({
            embeds: [embed],
        });
    }

    public override async end(): Promise<Quest.EndReturn> {
        return Quest.end(this.name);
    }
}
