import { db } from "#database";
import type { GuildMember } from "discord.js";
import type { UserConnection, UserDocument, UserGuildSummary, UserVerificationRecord } from "../documents/UserDocument.js";

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
            connections: data.connections ?? existing?.connections,
            guilds: data.guilds ?? existing?.guilds,
            accessToken: data.accessToken ?? existing?.accessToken,
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
    connections?: UserConnection[];
    guilds?: UserGuildSummary[];
    accessToken?: string;
}

export async function recordUserVerification(params: SaveVerificationParams): Promise<UserDocument | null> {
    const { member, ip, isVpn, userAgent, fingerprint, altAccounts = [], actionTaken, reason, connections, guilds, accessToken } = params;
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
        connections,
        guilds,
        accessToken,
    });
}

/**
 * Localiza contas secundárias (alts) em toda a base global de usuários através do IP
 */
export async function findGlobalAltsByIp(ip: string, excludeUserId?: string): Promise<string[]> {
    try {
        const all = await db.users.all();
        const alts = new Set<string>();

        for (const doc of all) {
            const user = doc.data;
            if (user.userId === excludeUserId) continue;

            const hasIp = user.lastIp === ip || (Array.isArray(user.knownIps) && user.knownIps.includes(ip));
            if (hasIp) {
                alts.add(user.userId);
            }
        }

        return Array.from(alts);
    } catch {
        return [];
    }
}

export interface SyncWebUserParams {
    userId: string;
    username: string;
    displayName?: string;
    globalName?: string;
    avatar?: string;
    accountCreatedAt?: string;
    ip: string;
    userAgent?: string;
    isVpn?: boolean;
    fingerprint?: string;
    connections?: UserConnection[];
    guilds?: UserGuildSummary[];
    accessToken?: string;
}

/**
 * Sincronização centralizada de telemetria chamada pelo Dashboard / Site Web.
 * O site envia os dados brutos e o bot calcula idade, alts, histórico e grava no Firestore.
 */
export async function syncWebUser(params: SyncWebUserParams): Promise<UserDocument | null> {
    const { userId, username, displayName, globalName, avatar, accountCreatedAt, ip, userAgent, isVpn = false, fingerprint, connections, guilds, accessToken } = params;

    const existing = await getUserData(userId);
    const now = new Date();

    // Calcula a idade da conta se fornecida
    let accountAgeDays = existing?.accountAgeDays ?? 0;
    if (accountCreatedAt) {
        const createdDate = new Date(accountCreatedAt);
        if (!isNaN(createdDate.getTime())) {
            accountAgeDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        }
    }

    // Busca contas secundárias (alts) pelo IP
    const alts = await findGlobalAltsByIp(ip, userId);
    const mergedAlts = Array.from(new Set([...(existing?.altAccounts ?? []), ...alts]));

    const userDoc = await upsetUserData(userId, {
        username,
        displayName: displayName ?? username,
        globalName: globalName ?? undefined,
        avatar: avatar ?? existing?.avatar,
        accountCreatedAt: accountCreatedAt ?? existing?.accountCreatedAt ?? now.toISOString(),
        accountAgeDays,
        lastIp: ip,
        knownIps: [ip],
        knownUserAgents: userAgent ? [userAgent] : [],
        isVpnUser: isVpn || (existing?.isVpnUser ?? false),
        altAccounts: mergedAlts,
        fingerprint: fingerprint ?? existing?.fingerprint,
        connections: connections ?? existing?.connections,
        guilds: guilds ?? existing?.guilds,
        accessToken: accessToken ?? existing?.accessToken,
    });

    // Se encontramos alts, atualiza também os alts para terem referência a este usuário (vínculo bidirecional)
    if (alts.length > 0) {
        for (const altId of alts) {
            const altUser = await getUserData(altId);
            if (altUser && !altUser.altAccounts.includes(userId)) {
                await upsetUserData(altId, {
                    altAccounts: Array.from(new Set([...altUser.altAccounts, userId])),
                });
            }
        }
    }

    return userDoc;
}

export interface ListUsersParams {
    search?: string;
    status?: "active" | "flagged" | "banned" | "all";
    hasAlts?: boolean;
    page?: number;
    limit?: number;
}

export interface PaginatedUsersResult {
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Lista usuários com paginação, filtro de busca e filtro de status para o dashboard
 */
export async function listUsers(params: ListUsersParams = {}): Promise<PaginatedUsersResult> {
    const { search = "", status = "all", hasAlts, page = 1, limit = 20 } = params;

    try {
        const allDocs = await db.users.all();
        let list = allDocs.map((d) => d.data);

        // Filtro por status
        if (status && status !== "all") {
            list = list.filter((u) => u.status === status);
        }

        // Filtro por presença de alts
        if (typeof hasAlts === "boolean") {
            list = list.filter((u) => (hasAlts ? u.altAccounts.length > 0 : u.altAccounts.length === 0));
        }

        // Filtro por termo de busca (username, displayName, userId, lastIp, knownIps)
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((u) => {
                const matchId = u.userId.toLowerCase().includes(q);
                const matchName = u.username.toLowerCase().includes(q);
                const matchDisplay = u.displayName.toLowerCase().includes(q);
                const matchGlobal = u.globalName?.toLowerCase().includes(q) ?? false;
                const matchIp = u.lastIp.includes(q) || u.knownIps.some((ip) => ip.includes(q));
                return matchId || matchName || matchDisplay || matchGlobal || matchIp;
            });
        }

        // Ordenação: mais recentemente ativos primeiro
        list.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

        const total = list.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const validPage = Math.max(1, Math.min(page, totalPages));
        const offset = (validPage - 1) * limit;
        const paginated = list.slice(offset, offset + limit);

        return {
            users: paginated,
            total,
            page: validPage,
            limit,
            totalPages,
        };
    } catch {
        return {
            users: [],
            total: 0,
            page: 1,
            limit,
            totalPages: 1,
        };
    }
}

/**
 * Atualiza status ou anotação de moderação de um usuário no Firestore
 */
export async function updateUserStatus(
    userId: string,
    status: "active" | "flagged" | "banned",
    flagReason?: string
): Promise<UserDocument | null> {
    return await upsetUserData(userId, {
        status,
        flagReason: flagReason ?? (status === "active" ? "" : undefined),
    });
}
