import { db } from "#database";
import { env } from "#env";
import { encryptData, getActiveVerificationSessionsCount } from "#functions";
import ck from "chalk";
import { ChannelType, type Client } from "discord.js";
import type { SystemStatusDocument } from "../database/documents/SystemStatusDocument.js";

let latestSnapshot: SystemStatusDocument | null = null;
let syncIntervalTimer: NodeJS.Timeout | null = null;
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hora (3.600.000 ms)

export function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

/**
 * Coleta exaustivamente todos os status possíveis do bot, gateway, banco de dados e máquina
 */
export async function collectBotStatus(client: Client<true>): Promise<SystemStatusDocument> {
    const now = new Date();
    const nextUpdate = new Date(now.getTime() + SYNC_INTERVAL_MS);

    // 1. Métricas de Servidores e Canais
    const guildsList = client.guilds.cache.map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.iconURL() ?? null,
        memberCount: g.memberCount,
        channelsCount: g.channels.cache.size,
        rolesCount: g.roles.cache.size,
    }));

    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    const cachedMembers = client.users.cache.size;

    let textChannels = 0;
    let voiceChannels = 0;
    let categoryChannels = 0;

    for (const channel of client.channels.cache.values()) {
        if (channel.isTextBased()) textChannels++;
        if (channel.isVoiceBased()) voiceChannels++;
        if (channel.type === ChannelType.GuildCategory) categoryChannels++;
    }

    // 2. Métricas de Segurança e Banco de Dados (Firestore)
    let totalUsers = 0;
    let totalVerified = 0;
    let totalFlagged = 0;
    let totalBanned = 0;
    let totalAlts = 0;
    let totalVpn = 0;

    try {
        const allUserDocs = await db.users.all();
        const users = allUserDocs.map((d) => d.data);
        totalUsers = users.length;

        for (const user of users) {
            if (user.status === "flagged") totalFlagged++;
            if (user.status === "banned") totalBanned++;
            if (user.isVpnUser) totalVpn++;
            if (Array.isArray(user.altAccounts) && user.altAccounts.length > 0) totalAlts++;

            const isVerified = Object.values(user.verifications || {}).some(
                (v) => v.actionTaken === "verified"
            );
            if (isVerified) totalVerified++;
        }
    } catch {
        // Fallback resiliente se Firestore estiver em inicialização ou sem conexão
    }

    // 3. Comandos Registrados
    const appCommands = client.application?.commands.cache;
    const commandNames = appCommands && appCommands.size > 0
        ? Array.from(appCommands.values()).map((c) => c.name)
        : ["calculadora", "help", "ping"];

    // 4. Recursos de Sistema
    const mem = process.memoryUsage();
    const processSeconds = Math.floor(process.uptime());

    const snapshot: SystemStatusDocument = {
        id: "bot_status",
        updatedAt: now.toISOString(),
        nextUpdateAt: nextUpdate.toISOString(),
        intervalMinutes: 60,
        bot: {
            id: client.user.id,
            username: client.user.username,
            tag: client.user.tag,
            name: constants.bot.name,
            avatar: client.user.displayAvatarURL(),
            status: "online",
        },
        guilds: {
            total: client.guilds.cache.size,
            list: guildsList,
        },
        members: {
            total: totalMembers,
            cached: cachedMembers,
        },
        channels: {
            total: client.channels.cache.size,
            text: textChannels,
            voice: voiceChannels,
            categories: categoryChannels,
        },
        network: {
            wsPingMs: client.ws.ping,
            status: client.ws.status,
        },
        uptime: {
            processSeconds,
            formatted: formatUptime(processSeconds),
            startedAt: new Date(Date.now() - processSeconds * 1000).toISOString(),
        },
        security: {
            totalUsers,
            totalVerified,
            totalFlagged,
            totalBanned,
            totalAlts,
            totalVpn,
            activeVerificationSessions: getActiveVerificationSessionsCount(),
        },
        commands: {
            total: commandNames.length,
            names: commandNames,
        },
        system: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryRssMb: Math.round(mem.rss / 1024 / 1024),
            memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
            memoryHeapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        },
    };

    return snapshot;
}

/**
 * Executa um ciclo completo de sincronização:
 * 1. Coleta telemetria
 * 2. Atualiza cache em memória
 * 3. Persiste no Firestore em `system/bot_status`
 * 4. Envia via POST autenticado e criptografado para o site (${env.DASHBOARD_URL}/api/bot/status)
 */
export async function syncBotStatus(client: Client<true>): Promise<SystemStatusDocument> {
    try {
        const snapshot = await collectBotStatus(client);
        latestSnapshot = snapshot;

        // 1. Persistir no Firestore na coleção `system`
        try {
            await db.system.set(db.system.id("bot_status"), snapshot);
        } catch (dbError) {
            console.error(ck.yellow("⚠ [StatusSync] Não foi possível persistir no Firestore:"), dbError);
        }

        // 2. Disparar POST ativo para o Dashboard / Site
        if (env.DASHBOARD_URL) {
            const targetUrl = `${env.DASHBOARD_URL}/api/bot/status`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);

            // Criptografa envelope AES-256-GCM para tráfego seguro
            const encryptedEnvelope = encryptData(snapshot);

            try {
                const response = await fetch(targetUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": env.API_SECRET_KEY,
                    },
                    body: JSON.stringify({
                        encrypted: true,
                        envelope: encryptedEnvelope,
                        fallback: {
                            updatedAt: snapshot.updatedAt,
                            status: "online",
                            members: snapshot.members.total,
                            guilds: snapshot.guilds.total,
                        },
                    }),
                    signal: controller.signal,
                });

                clearTimeout(timeout);

                if (response.ok) {
                    console.log(ck.green(`✔ [StatusSync] Telemetria horária entregue ao site com sucesso (${targetUrl})`));
                } else {
                    console.log(ck.yellow(`⚠ [StatusSync] Site respondeu HTTP ${response.status} ao receber telemetria`));
                }
            } catch {
                clearTimeout(timeout);
                // Erro de rede esperado se o dashboard web não estiver ouvindo no momento
                console.log(ck.gray(`● [StatusSync] Notificação ao site ignorada (offline). Telemetria salva na API e no Firestore.`));
            }
        }

        return snapshot;
    } catch (error) {
        console.error(ck.red("✖ [StatusSync] Erro no ciclo de telemetria:"), error);
        throw error;
    }
}

/**
 * Retorna o último snapshot de status em memória (0ms de latência)
 */
export function getLatestBotStatus(): SystemStatusDocument | null {
    return latestSnapshot;
}

/**
 * Inicializa o serviço de sincronização horária (executa a cada 1 hora)
 */
export function startStatusSyncService(client: Client<true>) {
    if (syncIntervalTimer) {
        clearInterval(syncIntervalTimer);
    }

    // Coleta inicial após 5 segundos para estabilização dos caches
    setTimeout(() => {
        syncBotStatus(client).catch(() => null);
    }, 5000);

    // Agenda ciclo a cada 1 hora (3.600.000 ms)
    syncIntervalTimer = setInterval(() => {
        syncBotStatus(client).catch(() => null);
    }, SYNC_INTERVAL_MS);

    console.log(ck.cyan("● [StatusSync] Serviço de telemetria horária ativado (Atualização a cada 1 hora)"));
}
