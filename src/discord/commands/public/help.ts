import { createCommand } from "#base";
import { createContainer, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";

// Catálogo com emojis temáticos para enriquecer os comandos
const COMMAND_METADATA: Record<string, { emoji: string; category: string }> = {
    help: { emoji: "🌌", category: "Sistema" },
    ping: { emoji: "🏓", category: "Diagnóstico" },
    counter: { emoji: "🔢", category: "Interativo" },
};

createCommand({
    name: "help",
    description: "Central de auxílio e comandos do Vantinha 🌌",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // 1. Resposta diferida imediata para anular qualquer risco de timeout (3s) do Discord
        await interaction.deferReply({ ephemeral: true });

        try {
            // 2. Busca do cache em memória (quase instantâneo, 0ms)
            let appCommands = interaction.client.application?.commands?.cache;
            if (!appCommands || appCommands.size === 0) {
                appCommands = await interaction.client.application?.commands?.fetch().catch(() => appCommands);
            }

            const chatCommands = appCommands
                ? appCommands.filter((cmd) => cmd.type === ApplicationCommandType.ChatInput)
                : null;

            // Monta a listagem dinâmica de comandos
            const commandLines: string[] = [];

            if (chatCommands && chatCommands.size > 0) {
                for (const cmd of chatCommands.values()) {
                    const meta = COMMAND_METADATA[cmd.name] ?? { emoji: "⚡", category: "Geral" };
                    const desc = cmd.description || "Comando do ecossistema Vanta.";
                    commandLines.push(`• ${meta.emoji} **\`/${cmd.name}\`** — ${desc}`);
                }
            } else {
                // Fallback de segurança garantido
                commandLines.push(
                    "• 🌌 **`/help`** — Central de auxílio e comandos do Vantinha.",
                    "• 🏓 **`/ping`** — Analisa a latência do gateway Discord e tempo de resposta.",
                    "• 🔢 **`/counter`** — Contador interativo oficial do Vantinha."
                );
            }

            const totalCmds = chatCommands && chatCommands.size > 0 ? chatCommands.size : 3;

            const container = createContainer(
                constants.colors.vantaAccent,
                createSection(
                    `# 🌌 Central de Comandos • Vantinha\nEu sou o assistente oficial do ecossistema **Vanta**, operando em alta frequência para auxiliar você e a comunidade.`,
                    new ButtonBuilder({
                        customId: "help/refresh",
                        label: `${totalCmds} Comandos Ativos`,
                        style: ButtonStyle.Secondary,
                        disabled: true,
                        emoji: "✨",
                    })
                ),
                Separator.Default,
                createTextDisplay(
                    `### 📜 Comandos Disponíveis (${totalCmds})\n` +
                    commandLines.join("\n")
                ),
                Separator.Default,
                createTextDisplay(
                    "### 🛰️ Suporte & Ecossistema Vanta\n" +
                    "• **Comunidade:** Vanta Ecosystem Oficial\n" +
                    "• **Status:** Operacional e vigilante 24/7\n" +
                    "• **Segurança:** Proteção de membros e gateway ativo"
                ),
                Separator.Hidden,
                createTextDisplay("💡 *Dica: Use os comandos acima diretamente no chat para interagir com o Vantinha.*")
            );

            await interaction.editReply({
                flags: [MessageFlags.IsComponentsV2],
                components: [container],
            });
        } catch (error) {
            console.error("Erro ao executar /help:", error);
            await interaction.editReply({
                content: "Ocorreu uma oscilação temporária ao carregar a central de ajuda. Tente novamente.",
            }).catch(() => null);
        }
    },
});
