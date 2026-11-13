import { createContainer, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, MessageFlags, type MessageCreateOptions } from "discord.js";
import crypto from "node:crypto";
import type { GuildVerificationConfig } from "../database/documents/GuildDocument.js";

// Armazenamento em memória para sessões de verificação ativas (expiração de 15 minutos)
interface VerificationSession {
    token: string;
    guildId: string;
    userId: string;
    createdAt: number;
    expiresAt: number;
}

const activeSessions = new Map<string, VerificationSession>();

export function createVerificationSession(guildId: string, userId: string): string {
    const now = Date.now();
    for (const [token, session] of activeSessions.entries()) {
        if (session.expiresAt < now) {
            activeSessions.delete(token);
        }
    }

    const token = crypto.randomBytes(32).toString("hex");
    activeSessions.set(token, {
        token,
        guildId,
        userId,
        createdAt: now,
        expiresAt: now + 15 * 60 * 1000, // 15 minutos
    });

    return token;
}

export function validateVerificationSession(token: string): VerificationSession | null {
    const session = activeSessions.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
        activeSessions.delete(token);
        return null;
    }
    return session;
}

export function consumeVerificationSession(token: string): VerificationSession | null {
    const session = validateVerificationSession(token);
    if (session) {
        activeSessions.delete(token);
    }
    return session;
}

export function buildVerificationPanel(config: GuildVerificationConfig): MessageCreateOptions {
    const accentColor = config.ui.accentColor || constants.colors.vantaAccent;

    const button = new ButtonBuilder({
        customId: "verification/start",
        label: config.ui.buttonLabel || "Verificar Conta",
        style: ButtonStyle.Success,
        emoji: config.ui.buttonEmoji || constants.emojis.protegidocomsucesso,
    });

    const container = createContainer(
        accentColor,
        createSection(
            `# ${config.ui.title || `${constants.emojis.Logovanta} Verificação Oficial • Vanta`}\n${
                config.ui.description ||
                "Realize sua verificação para liberar acesso completo ao servidor e seus recursos."
            }`,
            button
        ),
        Separator.Default,
        createTextDisplay(
            `${constants.emojis.protegidocomsucesso} **Segurança Ativa:** Proteção contra contas duplicadas (alts) e verificação de integridade de rede.`
        ),
        Separator.Hidden,
        createTextDisplay(`*${config.ui.footerText || "Vanta Security Gateway • Autenticação Segura"}*`)
    );

    return {
        flags: [MessageFlags.IsComponentsV2],
        components: [container],
    };
}

/**
 * Escopos oficiais obrigatórios de autorização OAuth2 do Vanta
 */
export const DISCORD_OAUTH_SCOPES = [
    "identify",
    "guilds",
    "guilds.join",
    "connections"
] as const;

export interface BuildOAuthUrlParams {
    clientId: string;
    redirectUri: string;
    state?: string;
    prompt?: "consent" | "none";
}

/**
 * Constrói o link oficial do Discord OAuth2 com os 4 escopos configurados:
 * identify, guilds, guilds.join e connections.
 */
export function buildDiscordOAuthUrl(params: BuildOAuthUrlParams): string {
    const { clientId, redirectUri, state, prompt = "consent" } = params;
    const query = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: DISCORD_OAUTH_SCOPES.join(" "),
        prompt,
    });

    if (state) {
        query.set("state", state);
    }

    return `https://discord.com/oauth2/authorize?${query.toString()}`;
}
