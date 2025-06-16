import { Client, Events, GuildMember, type PartialGuildMember } from "discord.js";
import { UserModel } from "@/models/user";
import { Service } from "@/service";

export default class TimeoutService extends Service.Base {
    override async start(client: Client): Promise<void> {
        client.on(Events.GuildMemberUpdate, this.handleGuildMemberUpdate);
    }

    override async stop(client: Client): Promise<void> {
        client.off(Events.GuildMemberUpdate, this.handleGuildMemberUpdate);
    }

    private handleGuildMemberUpdate = async (
        oldMember: GuildMember | PartialGuildMember,
        newMember: GuildMember,
    ): Promise<void> => {
        if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {
            try {
                const dbUser = await UserModel.findOneAndUpdate(
                    { id: newMember.id },
                    { $inc: { timeouts: 1 }, username: newMember.displayName },
                    { new: true, upsert: true, setDefaultsOnInsert: true },
                );
                console.info(
                    `User ${newMember.displayName} (${newMember.id}) timeout count updated to ${dbUser.timeouts}.`,
                );
            } catch (err) {
                console.error(err, `Failed to update timeout for user ${newMember.id}`);
            }
        }
    };
}
