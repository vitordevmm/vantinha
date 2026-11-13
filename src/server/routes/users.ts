import {
    getUserData,
    listUsers,
    syncWebUser,
    updateUserStatus,
    type SyncWebUserParams,
} from "#database";
import { processSecureRequest, sendSecureResponse } from "#functions";
import type { Client } from "discord.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const syncUserSchema = z.object({
    userId: z.string({ required_error: "userId é obrigatório" }),
    username: z.string({ required_error: "username é obrigatório" }),
    displayName: z.string().optional(),
    globalName: z.string().optional(),
    avatar: z.string().optional(),
    accountCreatedAt: z.string().optional(),
    ip: z.string({ required_error: "ip é obrigatório" }),
    userAgent: z.string().optional(),
    isVpn: z.boolean().optional(),
    fingerprint: z.string().optional(),
});

const updateUserStatusSchema = z.object({
    status: z.enum(["active", "flagged", "banned"]),
    flagReason: z.string().optional(),
});

const userActionSchema = z.object({
    action: z.enum(["kick", "ban", "unban"]),
    guildId: z.string({ required_error: "guildId é obrigatório" }),
    reason: z.string().optional(),
});

export function usersRoutes(app: FastifyInstance, client: Client<true>) {
    /**
     * POST /api/users/sync
     * Ponto central de sincronização de telemetria do site/dashboard.
     * O site envia o login OAuth / acesso e o bot calcula alts, idade, IPs conhecidos e grava no Firestore.
     */
    app.post("/api/users/sync", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest<SyncWebUserParams>(req, res);
        if (!auth.authorized || !auth.payload) return;

        const parsed = syncUserSchema.safeParse(auth.payload);
        if (!parsed.success) {
            return sendSecureResponse(
                res,
                StatusCodes.BAD_REQUEST,
                {
                    error: "Dados inválidos",
                    details: parsed.error.flatten().fieldErrors,
                },
                auth.isEncrypted
            );
        }

        try {
            const synced = await syncWebUser(parsed.data);
            if (!synced) {
                return sendSecureResponse(
                    res,
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    { error: "Erro ao salvar usuário no Firestore" },
                    auth.isEncrypted
                );
            }

            return sendSecureResponse(
                res,
                StatusCodes.OK,
                {
                    success: true,
                    message: "Usuário sincronizado com sucesso no Firestore",
                    user: synced,
                },
                auth.isEncrypted
            );
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: "Erro interno ao processar sincronização", details: String(error) },
                auth.isEncrypted
            );
        }
    });

    /**
     * GET /api/users
     * Lista usuários para a tabela do dashboard com filtros e paginação
     */
    app.get("/api/users", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest(req, res);
        if (!auth.authorized) return;

        const query = req.query as {
            search?: string;
            status?: "active" | "flagged" | "banned" | "all";
            hasAlts?: string;
            page?: string;
            limit?: string;
        };

        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 20;
        const hasAlts = query.hasAlts !== undefined ? query.hasAlts === "true" : undefined;

        try {
            const result = await listUsers({
                search: query.search,
                status: query.status,
                hasAlts,
                page: isNaN(page) ? 1 : page,
                limit: isNaN(limit) ? 20 : Math.min(limit, 100),
            });

            return sendSecureResponse(res, StatusCodes.OK, result, auth.isEncrypted);
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: "Erro ao listar usuários", details: String(error) },
                auth.isEncrypted
            );
        }
    });

    /**
     * GET /api/users/:userId
     * Retorna dossiê completo do usuário com enriquecimento em tempo real do Discord
     */
    app.get("/api/users/:userId", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest(req, res);
        if (!auth.authorized) return;

        const { userId } = req.params as { userId: string };

        try {
            const userDoc = await getUserData(userId);
            if (!userDoc) {
                return sendSecureResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    { error: "Usuário não encontrado no banco de dados" },
                    auth.isEncrypted
                );
            }

            // Enriquecimento ao vivo: checa presença nas guildas do Discord
            const mutualGuilds = [];
            for (const guild of client.guilds.cache.values()) {
                const member = guild.members.cache.get(userId);
                if (member) {
                    mutualGuilds.push({
                        guildId: guild.id,
                        guildName: guild.name,
                        nickname: member.nickname,
                        joinedAt: member.joinedAt?.toISOString(),
                        roles: member.roles.cache.map((r) => ({
                            id: r.id,
                            name: r.name,
                            color: r.hexColor,
                        })),
                        permissions: member.permissions.toArray(),
                    });
                }
            }

            return sendSecureResponse(
                res,
                StatusCodes.OK,
                {
                    user: userDoc,
                    discord: {
                        isCached: client.users.cache.has(userId),
                        mutualGuilds,
                    },
                },
                auth.isEncrypted
            );
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: "Erro ao consultar usuário", details: String(error) },
                auth.isEncrypted
            );
        }
    });

    /**
     * PUT /api/users/:userId
     * Atualização de status e anotações administrativas a partir do dashboard
     */
    app.put("/api/users/:userId", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest<{ status: "active" | "flagged" | "banned"; flagReason?: string }>(req, res);
        if (!auth.authorized || !auth.payload) return;

        const { userId } = req.params as { userId: string };
        const parsed = updateUserStatusSchema.safeParse(auth.payload);

        if (!parsed.success) {
            return sendSecureResponse(
                res,
                StatusCodes.BAD_REQUEST,
                {
                    error: "Dados inválidos",
                    details: parsed.error.flatten().fieldErrors,
                },
                auth.isEncrypted
            );
        }

        try {
            const updated = await updateUserStatus(userId, parsed.data.status, parsed.data.flagReason);
            if (!updated) {
                return sendSecureResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    { error: "Usuário não encontrado para atualização" },
                    auth.isEncrypted
                );
            }

            return sendSecureResponse(
                res,
                StatusCodes.OK,
                {
                    success: true,
                    message: `Status do usuário atualizado para '${parsed.data.status}'`,
                    user: updated,
                },
                auth.isEncrypted
            );
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: "Erro ao atualizar status do usuário", details: String(error) },
                auth.isEncrypted
            );
        }
    });

    /**
     * POST /api/users/:userId/action
     * Executa ação no Discord (kick, ban, unban) acionada pelo painel administrativo
     */
    app.post("/api/users/:userId/action", async (req: FastifyRequest, res: FastifyReply) => {
        const auth = processSecureRequest<{ action: "kick" | "ban" | "unban"; guildId: string; reason?: string }>(req, res);
        if (!auth.authorized || !auth.payload) return;

        const { userId } = req.params as { userId: string };
        const parsed = userActionSchema.safeParse(auth.payload);

        if (!parsed.success) {
            return sendSecureResponse(
                res,
                StatusCodes.BAD_REQUEST,
                {
                    error: "Dados inválidos",
                    details: parsed.error.flatten().fieldErrors,
                },
                auth.isEncrypted
            );
        }

        const { action, guildId, reason = "Ação administrativa via Dashboard Vanta" } = parsed.data;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return sendSecureResponse(
                res,
                StatusCodes.NOT_FOUND,
                { error: "Servidor Discord não encontrado no cache do bot" },
                auth.isEncrypted
            );
        }

        try {
            if (action === "kick") {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (!member) {
                    return sendSecureResponse(res, StatusCodes.NOT_FOUND, { error: "Membro não encontrado neste servidor" }, auth.isEncrypted);
                }
                await member.kick(reason);
            } else if (action === "ban") {
                await guild.members.ban(userId, { reason });
                await updateUserStatus(userId, "banned", reason);
            } else if (action === "unban") {
                await guild.members.unban(userId, reason);
                await updateUserStatus(userId, "active", "Desbanido via Dashboard");
            }

            return sendSecureResponse(
                res,
                StatusCodes.OK,
                {
                    success: true,
                    message: `Ação '${action}' executada com sucesso contra o usuário ${userId}`,
                },
                auth.isEncrypted
            );
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                { error: `Falha ao executar ação '${action}' no Discord`, details: String(error) },
                auth.isEncrypted
            );
        }
    });
}
