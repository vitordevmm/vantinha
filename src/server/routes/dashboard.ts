import { db } from "#database";
import { processSecureRequest, sendSecureResponse } from "#functions";
import type { Client } from "discord.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";

export function dashboardRoutes(app: FastifyInstance, client: Client<true>) {
    /**
     * GET /api/dashboard/overview
     * Estatísticas completas para a página inicial do Dashboard
     */
    app.get("/api/dashboard/overview", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest(req, res);
        if (!auth.authorized) return;

        try {
            const allUserDocs = await db.users.all();
            const users = allUserDocs.map((d) => d.data);

            const totalUsers = users.length;
            let totalVerified = 0;
            let totalFlagged = 0;
            let totalBanned = 0;
            let totalAlts = 0;
            let totalVpn = 0;

            for (const user of users) {
                if (user.status === "flagged") totalFlagged++;
                if (user.status === "banned") totalBanned++;
                if (user.isVpnUser) totalVpn++;
                if (Array.isArray(user.altAccounts) && user.altAccounts.length > 0) totalAlts++;

                const hasVerifiedRecord = Object.values(user.verifications || {}).some(
                    (v) => v.actionTaken === "verified"
                );
                if (hasVerifiedRecord) totalVerified++;
            }

            // Atividades recentes (ordenadas por lastSeenAt)
            const recentUsers = [...users]
                .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())
                .slice(0, 8)
                .map((u) => ({
                    userId: u.userId,
                    username: u.username,
                    displayName: u.displayName,
                    avatar: u.avatar,
                    status: u.status,
                    lastSeenAt: u.lastSeenAt,
                    accountAgeDays: u.accountAgeDays,
                    hasAlts: u.altAccounts.length > 0,
                    isVpn: u.isVpnUser,
                }));

            const overview = {
                metrics: {
                    totalUsers,
                    totalVerified,
                    totalFlagged,
                    totalBanned,
                    totalAlts,
                    totalVpn,
                },
                bot: {
                    name: client.user.username,
                    tag: client.user.tag,
                    id: client.user.id,
                    avatar: client.user.displayAvatarURL(),
                    uptimeSeconds: Math.floor(process.uptime()),
                    wsPingMs: client.ws.ping,
                    guildsCount: client.guilds.cache.size,
                    cachedUsersCount: client.users.cache.size,
                    channelsCount: client.channels.cache.size,
                    nodeVersion: process.version,
                    memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
                },
                recentActivity: recentUsers,
            };

            return sendSecureResponse(res, StatusCodes.OK, overview, auth.isEncrypted);
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: "Erro ao gerar estatísticas do dashboard", details: String(error) },
                auth.isEncrypted
            );
        }
    });

    /**
     * GET /api/guilds/:guildId/members
     * Lista membros de um servidor específico com dados do Discord e status no Firestore
     */
    app.get("/api/guilds/:guildId/members", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest(req, res);
        if (!auth.authorized) return;

        const { guildId } = req.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return sendSecureResponse(
                res,
                StatusCodes.NOT_FOUND,
                { error: "Servidor não encontrado no cache do bot" },
                auth.isEncrypted
            );
        }

        try {
            // Tenta obter membros em cache
            const members = guild.members.cache.map((m) => ({
                id: m.id,
                username: m.user.username,
                displayName: m.displayName,
                avatar: m.user.displayAvatarURL(),
                bot: m.user.bot,
                joinedAt: m.joinedAt?.toISOString(),
                createdAt: m.user.createdAt.toISOString(),
                roles: m.roles.cache
                    .filter((r) => r.id !== guild.id)
                    .map((r) => ({ id: r.id, name: r.name, color: r.hexColor })),
            }));

            return sendSecureResponse(
                res,
                StatusCodes.OK,
                {
                    guildId: guild.id,
                    guildName: guild.name,
                    memberCount: guild.memberCount,
                    members,
                },
                auth.isEncrypted
            );
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: "Erro ao obter membros da guilda", details: String(error) },
                auth.isEncrypted
            );
        }
    });
}
