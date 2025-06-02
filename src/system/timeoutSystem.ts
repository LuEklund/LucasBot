import { UserModel } from "@/models/user";
import type { GuildMember, PartialGuildMember } from "discord.js";

export async function timeoutTracking(
    oldMemeber: GuildMember | PartialGuildMember,
    newMember: GuildMember,
) {
    const wasTimedOut = oldMemeber.communicationDisabledUntil;
    const isTimeOut = newMember.communicationDisabledUntil;
    if (!wasTimedOut && isTimeOut) {
        let dbUser = await UserModel.findOne({ id: newMember.id });
        if (dbUser) {
            dbUser.timeouts += 1;
            dbUser.save();
        } else {
            dbUser = await UserModel.create({
                id: newMember.id,
                username: newMember.displayName,
                timeouts: 1,
            });
        }
        // console.log(dbUser.username + ": timeouts = " + dbUser.timeouts);
    }
}
