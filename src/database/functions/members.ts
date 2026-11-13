import { db, type DatabaseSchema } from "#database";
import { GuildMember } from "discord.js";

export async function getMemberData(member: GuildMember) {
    const memberDocument = await db.guilds(db.guilds.id(member.guild.id)).members.get(
        db.guilds(db.guilds.id(member.guild.id)).members.id(member.id)
    );
    return { memberDocument, data: memberDocument?.data };
}

type UpsetData = DatabaseSchema["guilds"]["sub"]["members"]["AssignArg"];
export async function upsetMemberData(member: GuildMember, data: UpsetData){
    return await db.guilds(db.guilds.id(member.guild.id)).members.upset(
        db.guilds(db.guilds.id(member.guild.id)).members.id(member.id),
        data
    );
}

type UpdateData = DatabaseSchema["guilds"]["sub"]["members"]["UpdateData"];
export async function updateMemberData(member: GuildMember, data: UpdateData){
    return await db.guilds(db.guilds.id(member.guild.id)).members.update(
        db.guilds(db.guilds.id(member.guild.id)).members.id(member.id),
        data
    );
}
