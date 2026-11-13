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
        emoji: config.ui.buttonEmoji || "🛡️",
    });

    const container = createContainer(
        accentColor,
        createSection(
            `# ${config.ui.title || "🌌 Verificação Oficial • Vanta"}\n${
                config.ui.description ||
                "Realize sua verificação para liberar acesso completo ao servidor e seus recursos."
            }`,
            button
        ),
        Separator.Default,
        createTextDisplay(
            "🔒 **Segurança Ativa:** Proteção contra contas duplicadas (alts) e verificação de integridade de rede."
        ),
        Separator.Hidden,
        createTextDisplay(`*${config.ui.footerText || "Vanta Security Gateway • Autenticação Segura"}*`)
    );

    return {
        flags: [MessageFlags.IsComponentsV2],
        components: [container],
    };
}
