import { db } from "#database";
import type { GuildVerificationConfig, VerificationLogEntry } from "../documents/GuildDocument.js";

export function getDefaultVerificationConfig(): GuildVerificationConfig {
    return {
        enabled: false,
        channelId: undefined,
        messageId: undefined,
        roleId: undefined,
        removeRoleId: undefined,
        logChannelId: undefined,
        security: {
            blockAlts: true,
            altAction: "kick",
            blockVpn: true,
            vpnAction: "block",
            maxAccountsPerIp: 1,
        },
        ui: {
            title: `${constants.emojis.Logovanta} Verificação Oficial • Vanta`,
            description: "Para acessar todos os canais do servidor e liberar sua conta no cluster, realize sua verificação segura clicando no botão abaixo.",
            accentColor: constants.colors.vantaAccent,
            buttonLabel: "Verificar Conta",
            buttonEmoji: constants.emojis.protegidocomsucesso,
            footerText: "Vanta Security Gateway • Autenticação Segura",
        },
    };
}

export async function getVerificationConfig(guildId: string): Promise<GuildVerificationConfig> {
    try {
        const doc = await db.guilds.get(db.guilds.id(guildId));
        if (doc?.data?.verification) {
            return {
                ...getDefaultVerificationConfig(),
                ...doc.data.verification,
                security: {
                    ...getDefaultVerificationConfig().security,
                    ...(doc.data.verification.security ?? {}),
                },
                ui: {
                    ...getDefaultVerificationConfig().ui,
                    ...(doc.data.verification.ui ?? {}),
                },
            };
        }
    } catch {
        // Fallback gracefully if database is in placeholder mode
    }
    return getDefaultVerificationConfig();
}

export async function saveVerificationConfig(
    guildId: string,
    updates: Partial<GuildVerificationConfig>
): Promise<GuildVerificationConfig> {
    const current = await getVerificationConfig(guildId);
    const updated: GuildVerificationConfig = {
        ...current,
        ...updates,
        security: {
            ...current.security,
            ...(updates.security ?? {}),
        },
        ui: {
            ...current.ui,
            ...(updates.ui ?? {}),
        },
    };

    try {
        await db.guilds.upset(db.guilds.id(guildId), {
            verification: updated,
        });
    } catch {
        // Safe mode if Firestore credentials are dummy
    }

    return updated;
}

export async function recordVerificationLog(
    guildId: string,
    log: VerificationLogEntry
): Promise<void> {
    try {
        const doc = await db.guilds.get(db.guilds.id(guildId));
        const currentLogs: VerificationLogEntry[] = doc?.data?.verificationLogs ?? [];
        const nextLogs = [log, ...currentLogs].slice(0, 100);

        await db.guilds.upset(db.guilds.id(guildId), {
            verificationLogs: nextLogs,
        });
    } catch {
        // Safe mode
    }
}

export async function getVerificationLogs(guildId: string): Promise<VerificationLogEntry[]> {
    try {
        const doc = await db.guilds.get(db.guilds.id(guildId));
        return doc?.data?.verificationLogs ?? [];
    } catch {
        return [];
    }
}

export async function findAltsByIp(
    guildId: string,
    ip: string,
    excludeUserId?: string
): Promise<string[]> {
    const logs = await getVerificationLogs(guildId);
    const alts = new Set<string>();

    for (const entry of logs) {
        if (entry.ip === ip && entry.userId !== excludeUserId && entry.actionTaken === "verified") {
            alts.add(entry.userId);
        }
    }

    return Array.from(alts);
}
