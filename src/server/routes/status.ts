import { env } from "#env";
import {
    collectBotStatus,
    getLatestBotStatus,
    processSecureRequest,
    sendSecureResponse,
    syncBotStatus,
} from "#functions";
import type { Client } from "discord.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";

export function statusRoutes(app: FastifyInstance, client: Client<true>) {
    /**
     * Helper para gerar a resposta pública limpa e segura
     */
    function getPublicStatusPayload(snapshot: ReturnType<typeof getLatestBotStatus>) {
        if (!snapshot) {
            return {
                status: "starting",
                bot: {
                    id: client.user.id,
                    username: client.user.username,
                    name: constants.bot.name,
                    avatar: client.user.displayAvatarURL(),
                },
                stats: {
                    totalGuilds: client.guilds.cache.size,
                    totalMembers: client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0),
                    cachedMembers: client.users.cache.size,
                    totalChannels: client.channels.cache.size,
                    wsPingMs: client.ws.ping,
                    uptimeSeconds: Math.floor(process.uptime()),
                },
                updatedAt: new Date().toISOString(),
                nextUpdateAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                interval: "1 hour",
            };
        }

        return {
            status: snapshot.bot.status,
            bot: snapshot.bot,
            stats: {
                totalGuilds: snapshot.guilds.total,
                totalMembers: snapshot.members.total,
                cachedMembers: snapshot.members.cached,
                totalChannels: snapshot.channels.total,
                textChannels: snapshot.channels.text,
                voiceChannels: snapshot.channels.voice,
                categoryChannels: snapshot.channels.categories,
                totalVerifiedUsers: snapshot.security.totalVerified,
                wsPingMs: snapshot.network.wsPingMs,
                uptimeSeconds: snapshot.uptime.processSeconds,
                uptimeFormatted: snapshot.uptime.formatted,
                totalCommands: snapshot.commands.total,
            },
            updatedAt: snapshot.updatedAt,
            nextUpdateAt: snapshot.nextUpdateAt,
            intervalMinutes: snapshot.intervalMinutes,
        };
    }

    /**
     * GET /api/bot/status
     * Se autenticado (x-api-key): retorna o snapshot completo (ou cifrado)
     * Se público: retorna as métricas seguras para consumo no site
     */
    app.get("/api/bot/status", async (req: FastifyRequest, res: FastifyReply) => {
        const apiKey = req.headers["x-api-key"];
        const isAuthorized = typeof apiKey === "string" && apiKey === env.API_SECRET_KEY;

        let snapshot = getLatestBotStatus();
        if (!snapshot) {
            snapshot = await collectBotStatus(client).catch(() => null);
        }

        if (isAuthorized) {
            const auth = processSecureRequest(req, res);
            return sendSecureResponse(res, StatusCodes.OK, snapshot, auth.isEncrypted);
        }

        return res.status(StatusCodes.OK).send(getPublicStatusPayload(snapshot));
    });

    /**
     * GET /api/bot/status/public
     * Endpoint explicitamente público para a home/landing page do site
     */
    app.get("/api/bot/status/public", async (_req: FastifyRequest, res: FastifyReply) => {
        let snapshot = getLatestBotStatus();
        if (!snapshot) {
            snapshot = await collectBotStatus(client).catch(() => null);
        }

        return res.status(StatusCodes.OK).send(getPublicStatusPayload(snapshot));
    });

    /**
     * GET /api/bot/status/full
     * Endpoint protegido exclusivo para o dashboard (retorna todas as métricas detalhadas)
     */
    app.get("/api/bot/status/full", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest(req, res);
        if (!auth.authorized) return;

        let snapshot = getLatestBotStatus();
        if (!snapshot) {
            snapshot = await collectBotStatus(client);
        }

        return sendSecureResponse(res, StatusCodes.OK, snapshot, auth.isEncrypted);
    });

    /**
     * POST /api/bot/status/sync
     * Endpoint protegido para forçar uma sincronização e notificação imediata
     */
    app.post("/api/bot/status/sync", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest(req, res);
        if (!auth.authorized) return;

        try {
            const freshSnapshot = await syncBotStatus(client);
            return sendSecureResponse(
                res,
                StatusCodes.OK,
                { message: "Telemetria sincronizada com sucesso", snapshot: freshSnapshot },
                auth.isEncrypted
            );
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: "Falha ao sincronizar status", details: String(error) },
                auth.isEncrypted
            );
        }
    });
}
