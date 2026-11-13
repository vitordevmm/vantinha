import { db } from "#database";
import type { GuildMember } from "discord.js";
import type { UserDocument, UserVerificationRecord } from "../documents/UserDocument.js";

export async function getUserData(userId: string): Promise<UserDocument | null> {
    try {
        const doc = await db.users.get(db.users.id(userId));
        return doc?.data ?? null;
    } catch {
        return null;
    }
}

export async function upsetUserData(
    userId: string,
    data: Partial<UserDocument>
): Promise<UserDocument | null> {
    try {
        const existing = await getUserData(userId);
        const merged: UserDocument = {
            userId,
            username: data.username ?? existing?.username ?? "Desconhecido",
            displayName: data.displayName ?? existing?.displayName ?? "Desconhecido",
            globalName: data.globalName ?? existing?.globalName,
            avatar: data.avatar ?? existing?.avatar,
            accountCreatedAt: data.accountCreatedAt ?? existing?.accountCreatedAt ?? new Date().toISOString(),
            accountAgeDays: data.accountAgeDays ?? existing?.accountAgeDays ?? 0,
            firstSeenAt: existing?.firstSeenAt ?? new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            lastIp: data.lastIp ?? existing?.lastIp ?? "0.0.0.0",
            knownIps: Array.from(new Set([...(existing?.knownIps ?? []), ...(data.knownIps ?? [])])),
            knownUserAgents: Array.from(new Set([...(existing?.knownUserAgents ?? []), ...(data.knownUserAgents ?? [])])),
            isVpnUser: data.isVpnUser ?? existing?.isVpnUser ?? false,
            altAccounts: Array.from(new Set([...(existing?.altAccounts ?? []), ...(data.altAccounts ?? [])])),
            status: data.status ?? existing?.status ?? "active",
            flagReason: data.flagReason ?? existing?.flagReason,
            verifications: {
                ...(existing?.verifications ?? {}),
                ...(data.verifications ?? {}),
            },
            joinedServerAt: data.joinedServerAt ?? existing?.joinedServerAt,
            fingerprint: data.fingerprint ?? existing?.fingerprint,
        };

        // Cast to any to satisfy Typesaurus WriteData recursive mapping
        await db.users.upset(db.users.id(userId), merged as any);
        return merged;
    } catch (error) {
        console.warn("Aviso ao salvar UserDocument no Firestore (modo seguro):", error);
        return null;
    }
}

export interface SaveVerificationParams {
    member: GuildMember;
    ip: string;
    isVpn: boolean;
    userAgent?: string;
    fingerprint?: string;
    altAccounts?: string[];
    actionTaken: "verified" | "blocked" | "flagged" | "kicked" | "banned";
    reason?: string;
}

export async function recordUserVerification(params: SaveVerificationParams): Promise<UserDocument | null> {
    const { member, ip, isVpn, userAgent, fingerprint, altAccounts = [], actionTaken, reason } = params;
    const now = new Date();
    const createdAt = member.user.createdAt;
    const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const verificationRecord: UserVerificationRecord = {
        guildId: member.guild.id,
        guildName: member.guild.name,
        verifiedAt: now.toISOString(),
        ip,
        isVpn,
        userAgent,
        fingerprint,
        altAccounts,
        actionTaken,
        reason,
    };

    const isFlagged = actionTaken === "flagged" || actionTaken === "blocked" || actionTaken === "banned";

    return await upsetUserData(member.id, {
        username: member.user.username,
        displayName: member.displayName,
        globalName: member.user.globalName ?? undefined,
        avatar: member.user.displayAvatarURL(),
        accountCreatedAt: createdAt.toISOString(),
        accountAgeDays,
        lastIp: ip,
        knownIps: [ip],
        knownUserAgents: userAgent ? [userAgent] : [],
        isVpnUser: isVpn,
        altAccounts,
        status: actionTaken === "banned" ? "banned" : isFlagged ? "flagged" : "active",
        flagReason: reason,
        verifications: {
            [member.guild.id]: verificationRecord,
        },
        joinedServerAt: member.joinedAt?.toISOString(),
        fingerprint,
    });
}
