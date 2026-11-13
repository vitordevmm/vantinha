import {
    findAltsByIp,
    getVerificationConfig,
    getVerificationLogs,
    recordUserVerification,
    recordVerificationLog,
    saveVerificationConfig,
} from "#database";
import {
    buildVerificationPanel,
    consumeVerificationSession,
    processSecureRequest,
    sendSecureResponse,
    validateVerificationSession,
} from "#functions";
import { createContainer, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ChannelType, MessageFlags, type Client, type TextChannel } from "discord.js";
import type { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { GuildVerificationConfig, VerificationLogEntry } from "../../database/documents/GuildDocument.js";

const updateConfigSchema = z.object({
    enabled: z.boolean().optional(),
    channelId: z.string().optional(),
    roleId: z.string().optional(),
    removeRoleId: z.string().optional().nullable(),
    logChannelId: z.string().optional().nullable(),
    security: z.object({
        blockAlts: z.boolean().optional(),
        altAction: z.enum(["block", "kick", "ban", "flag"]).optional(),
        blockVpn: z.boolean().optional(),
        vpnAction: z.enum(["block", "flag"]).optional(),
        maxAccountsPerIp: z.coerce.number().min(1).default(1),
    }).optional(),
    ui: z.object({
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        accentColor: z.string().optional(),
        buttonLabel: z.string().min(1).optional(),
        buttonEmoji: z.string().optional(),
        thumbnailUrl: z.string().optional().nullable(),
        footerText: z.string().optional(),
    }).optional(),
});

const verifySubmissionSchema = z.object({
    token: z.string().min(1),
    guildId: z.string().min(1),
    userId: z.string().min(1),
    ip: z.string().min(1),
    isVpn: z.boolean().default(false),
    userAgent: z.string().optional(),
    fingerprint: z.string().optional(),
    connections: z.array(z.any()).optional(),
    guilds: z.array(z.any()).optional(),
    accessToken: z.string().optional(),
});

export function verificationRoutes(app: FastifyInstance, client: Client<true>) {
    // 0. Handshake de Teste de Criptografia (POST /api/crypto/handshake)
    // Permite que o site confirme que sua chave de criptografia e x-api-key estão 100% sincronizadas com o bot
    app.post("/api/crypto/handshake", async (req, res) => {
        const { authorized, payload, isEncrypted } = processSecureRequest<{ ping?: string }>(req, res);
        if (!authorized) return;

        const responseData = {
            status: "vanta_secure_tunnel_online",
            bot: {
                id: client.user.id,
                name: client.user.username,
            },
            echoPing: payload?.ping ?? "pong",
            cipher: "aes-256-gcm",
            isEncrypted,
            timestamp: new Date().toISOString(),
        };

        return sendSecureResponse(res, StatusCodes.OK, responseData, isEncrypted);
    });

    // 1. Valida a sessão temporária para a página do site (GET /api/verification/session/:token)
    app.get("/api/verification/session/:token", async (req, res) => {
        const { token } = req.params as { token: string };
        const session = validateVerificationSession(token);
        const shouldEncrypt = req.headers["x-encrypted"] === "true";

        if (!session) {
            return sendSecureResponse(
                res,
                StatusCodes.NOT_FOUND,
                {
                    valid: false,
                    message: "Sessão de verificação inválida ou expirada. Solicite um novo link no Discord.",
                },
                shouldEncrypt
            );
        }

        const guild = client.guilds.cache.get(session.guildId);
        const member = guild ? await guild.members.fetch(session.userId).catch(() => null) : null;
        const config = await getVerificationConfig(session.guildId);

        const data = {
            valid: true,
            guild: {
                id: session.guildId,
                name: guild?.name ?? "Servidor Vanta",
                icon: guild?.iconURL() ?? null,
            },
            user: {
                id: session.userId,
                username: member?.user.username ?? "Usuário",
                displayName: member?.displayName ?? "Usuário",
                avatar: member?.user.displayAvatarURL() ?? null,
            },
            ui: config.ui,
            expiresAt: session.expiresAt,
        };

        return sendSecureResponse(res, StatusCodes.OK, data, shouldEncrypt);
    });

    // 2. Obter canais de texto do servidor para o dashboard (GET /api/guilds/:guildId/channels)
    app.get("/api/guilds/:guildId/channels", async (req, res) => {
        const { guildId } = req.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);
        const shouldEncrypt = req.headers["x-encrypted"] === "true";

        if (!guild) {
            return sendSecureResponse(res, StatusCodes.NOT_FOUND, { error: "Guilda não encontrada no cache do bot" }, shouldEncrypt);
        }

        const channels = guild.channels.cache
            .filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
            .map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                position: c.position,
            }))
            .sort((a, b) => a.position - b.position);

        return sendSecureResponse(res, StatusCodes.OK, { channels }, shouldEncrypt);
    });

    // 3. Obter cargos do servidor para o dashboard (GET /api/guilds/:guildId/roles)
    app.get("/api/guilds/:guildId/roles", async (req, res) => {
        const { guildId } = req.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);
        const shouldEncrypt = req.headers["x-encrypted"] === "true";

        if (!guild) {
            return sendSecureResponse(res, StatusCodes.NOT_FOUND, { error: "Guilda não encontrada no cache do bot" }, shouldEncrypt);
        }

        const roles = guild.roles.cache
            .filter(r => r.id !== guild.id && !r.managed)
            .map(r => ({
                id: r.id,
                name: r.name,
                color: r.hexColor,
                position: r.position,
            }))
            .sort((a, b) => b.position - a.position);

        return sendSecureResponse(res, StatusCodes.OK, { roles }, shouldEncrypt);
    });

    // 4. Obter configurações atuais da verificação (GET /api/guilds/:guildId/verification)
    app.get("/api/guilds/:guildId/verification", async (req, res) => {
        const { guildId } = req.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);
        const shouldEncrypt = req.headers["x-encrypted"] === "true";

        if (!guild) {
            return sendSecureResponse(res, StatusCodes.NOT_FOUND, { error: "Guilda não encontrada no cache do bot" }, shouldEncrypt);
        }

        const config = await getVerificationConfig(guildId);
        return sendSecureResponse(res, StatusCodes.OK, { config }, shouldEncrypt);
    });

    // 5. Salvar configurações da verificação via dashboard (PUT /api/guilds/:guildId/verification)
    // Suporta envio criptografado com retorno também criptografado
    app.put("/api/guilds/:guildId/verification", async (req, res) => {
        const { authorized, payload, isEncrypted } = processSecureRequest<any>(req, res);
        if (!authorized) return;

        const { guildId } = req.params as { guildId: string };
        const parsed = updateConfigSchema.safeParse(payload);

        if (!parsed.success) {
            return sendSecureResponse(
                res,
                StatusCodes.BAD_REQUEST,
                {
                    error: "Parâmetros inválidos",
                    details: parsed.error.issues,
                },
                isEncrypted
            );
        }

        const saved = await saveVerificationConfig(guildId, parsed.data as Partial<GuildVerificationConfig>);
        return sendSecureResponse(res, StatusCodes.OK, { success: true, config: saved }, isEncrypted);
    });

    // 6. Publicar ou Atualizar o Painel no Canal do Discord (POST /api/guilds/:guildId/verification/publish)
    app.post("/api/guilds/:guildId/verification/publish", async (req, res) => {
        const { authorized, isEncrypted } = processSecureRequest(req, res);
        if (!authorized) return;

        const { guildId } = req.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return sendSecureResponse(res, StatusCodes.NOT_FOUND, { error: "Guilda não encontrada" }, isEncrypted);
        }

        const config = await getVerificationConfig(guildId);
        if (!config.channelId) {
            return sendSecureResponse(
                res,
                StatusCodes.BAD_REQUEST,
                {
                    error: "Canal não configurado",
                    message: "Selecione o canal do painel antes de publicar.",
                },
                isEncrypted
            );
        }

        const channel = guild.channels.cache.get(config.channelId) as TextChannel | undefined;
        if (!channel || !channel.isTextBased()) {
            return sendSecureResponse(
                res,
                StatusCodes.BAD_REQUEST,
                {
                    error: "Canal inválido",
                    message: "O canal configurado não foi encontrado ou não é de texto.",
                },
                isEncrypted
            );
        }

        const panelPayload = buildVerificationPanel(config);
        let messageId = config.messageId;

        try {
            if (messageId) {
                const existingMsg = await channel.messages.fetch(messageId).catch(() => null);
                if (existingMsg) {
                    await existingMsg.edit({
                        components: panelPayload.components,
                        flags: [MessageFlags.IsComponentsV2],
                    });
                } else {
                    const sent = await channel.send({
                        components: panelPayload.components,
                        flags: [MessageFlags.IsComponentsV2],
                    });
                    messageId = sent.id;
                }
            } else {
                const sent = await channel.send({
                    components: panelPayload.components,
                    flags: [MessageFlags.IsComponentsV2],
                });
                messageId = sent.id;
            }

            await saveVerificationConfig(guildId, { messageId });

            return sendSecureResponse(
                res,
                StatusCodes.OK,
                {
                    success: true,
                    messageId,
                    channelId: channel.id,
                    channelName: channel.name,
                },
                isEncrypted
            );
        } catch (error) {
            return sendSecureResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                {
                    error: "Falha ao publicar painel",
                    details: String(error),
                },
                isEncrypted
            );
        }
    });

    // 7. Submissão de Verificação pelo Site (POST /api/verification/verify)
    // Suporta recepção de payload criptografado e resposta criptografada
    app.post("/api/verification/verify", async (req, res) => {
        const { authorized, payload, isEncrypted } = processSecureRequest<any>(req, res);
        if (!authorized) return;

        const parsed = verifySubmissionSchema.safeParse(payload);
        if (!parsed.success) {
            return sendSecureResponse(
                res,
                StatusCodes.BAD_REQUEST,
                {
                    error: "Payload de verificação inválido",
                    details: parsed.error.issues,
                },
                isEncrypted
            );
        }

        const { token, guildId, userId, ip, isVpn, userAgent, fingerprint, connections, guilds, accessToken } = parsed.data;

        // Consome a sessão temporária
        const session = consumeVerificationSession(token);
        if (!session || session.guildId !== guildId || session.userId !== userId) {
            return sendSecureResponse(
                res,
                StatusCodes.FORBIDDEN,
                {
                    error: "Token expirado ou inválido",
                    message: "Sua sessão expirou. Clique novamente no botão de verificação no Discord.",
                },
                isEncrypted
            );
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return sendSecureResponse(res, StatusCodes.NOT_FOUND, { error: "Guilda não encontrada" }, isEncrypted);
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) {
            return sendSecureResponse(res, StatusCodes.NOT_FOUND, { error: "Membro não encontrado no servidor" }, isEncrypted);
        }

        const config = await getVerificationConfig(guildId);
        const alts = await findAltsByIp(guildId, ip, userId);
        const hasAlts = alts.length > 0;

        let actionTaken: VerificationLogEntry["actionTaken"] = "verified";
        let reason: string | undefined = undefined;

        // Análise de Segurança 1: Contas Duplicadas (Alts)
        if (hasAlts && config.security.blockAlts) {
            const altAction = config.security.altAction;
            if (altAction === "block") {
                actionTaken = "blocked";
                reason = `Conta em dobro detectada no mesmo IP (${alts.length} conta(s) prévia(s))`;
            } else if (altAction === "kick") {
                actionTaken = "kicked";
                reason = `Expulso por uso de conta alternativa (${alts.join(", ")})`;
                await member.kick(reason).catch(() => null);
            } else if (altAction === "ban") {
                actionTaken = "banned";
                reason = `Banido por uso de conta alternativa (${alts.join(", ")})`;
                await member.ban({ reason }).catch(() => null);
            } else if (altAction === "flag") {
                actionTaken = "flagged";
                reason = `Sinalizado: Conta alternativa detectada (${alts.join(", ")})`;
            }
        }

        // Análise de Segurança 2: IP Suspeito / VPN / Proxy
        if (actionTaken !== "blocked" && actionTaken !== "kicked" && actionTaken !== "banned") {
            if (isVpn && config.security.blockVpn) {
                if (config.security.vpnAction === "block") {
                    actionTaken = "blocked";
                    reason = "Conexão VPN/Proxy não permitida pelas diretrizes de segurança";
                } else if (config.security.vpnAction === "flag") {
                    actionTaken = "flagged";
                    reason = reason ? `${reason} + VPN detectada` : "Sinalizado: Conexão via VPN/Proxy detectada";
                }
            }
        }

        // Se a verificação foi aprovada (ou flagged), entrega os cargos
        if (actionTaken === "verified" || actionTaken === "flagged") {
            try {
                if (config.roleId) {
                    await member.roles.add(config.roleId, "Verificação concluída via painel web Vanta");
                }
                if (config.removeRoleId) {
                    await member.roles.remove(config.removeRoleId, "Remoção de cargo pré-verificação");
                }
            } catch (roleError) {
                console.error("Erro ao gerenciar cargos do membro:", roleError);
            }
        }

        // Registrar Log no Histórico da Guilda
        const logEntry: VerificationLogEntry = {
            id: `log_${Date.now()}_${userId}`,
            userId: member.id,
            username: member.user.username,
            userTag: member.user.tag,
            userAvatar: member.user.displayAvatarURL(),
            guildId,
            verifiedAt: new Date().toISOString(),
            ip,
            isVpn,
            altDetected: hasAlts,
            altAccounts: alts,
            actionTaken,
            reason: reason ?? (userAgent ? `Navegador: ${userAgent.slice(0, 50)}` : undefined),
        };

        await recordVerificationLog(guildId, logEntry);

        // Gravar e enriquecer os dados base no UserDocument
        await recordUserVerification({
            member,
            ip,
            isVpn,
            userAgent,
            fingerprint,
            altAccounts: alts,
            actionTaken,
            reason,
            connections,
            guilds,
            accessToken,
        });

        // Enviar Log no Canal de Auditoria (100% Discord Components V2)
        if (config.logChannelId) {
            const logChannel = guild.channels.cache.get(config.logChannelId) as TextChannel | undefined;
            if (logChannel && logChannel.isTextBased()) {
                const isDanger = actionTaken === "blocked" || actionTaken === "kicked" || actionTaken === "banned";
                const isWarning = actionTaken === "flagged";

                const logContainer = createContainer(
                    isDanger ? constants.colors.danger : isWarning ? constants.colors.warning : constants.colors.success,
                    createSection(
                        `### 🛡️ Auditoria de Verificação • ${member.user.tag}\n` +
                        `• **Usuário:** <@${member.id}> (\`${member.id}\`)\n` +
                        `• **Status:** \`${actionTaken.toUpperCase()}\`\n` +
                        `• **IP:** \`${ip}\` (VPN: \`${isVpn ? "SIM" : "NÃO"}\`)\n` +
                        `• **Contas Duplicadas:** \`${hasAlts ? alts.length + " conta(s)" : "Nenhuma"}\`\n` +
                        (reason ? `• **Motivo/Ação:** ${reason}\n` : "") +
                        `• **Data:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                        member.user.displayAvatarURL()
                    ),
                    Separator.Default,
                    createTextDisplay(`Audit Log Vanta Gateway • ID de Registro: \`${logEntry.id}\``)
                );

                await logChannel.send({
                    flags: [MessageFlags.IsComponentsV2],
                    components: [logContainer],
                }).catch(() => null);
            }
        }

        const isSuccess = actionTaken === "verified" || actionTaken === "flagged";
        return sendSecureResponse(
            res,
            isSuccess ? StatusCodes.OK : StatusCodes.FORBIDDEN,
            {
                success: isSuccess,
                actionTaken,
                reason,
                member: {
                    id: member.id,
                    username: member.user.username,
                    tag: member.user.tag,
                },
            },
            isEncrypted
        );
    });

    // 8. Obter Histórico de Logs para o Dashboard (GET /api/guilds/:guildId/verification/logs)
    app.get("/api/guilds/:guildId/verification/logs", async (req, res) => {
        const { guildId } = req.params as { guildId: string };
        const logs = await getVerificationLogs(guildId);
        const shouldEncrypt = req.headers["x-encrypted"] === "true";

        return sendSecureResponse(res, StatusCodes.OK, { logs }, shouldEncrypt);
    });
}
