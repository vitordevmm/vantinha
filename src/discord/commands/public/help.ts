import { createCommand } from "#base";
import { createContainer, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

// Catálogo com emojis temáticos para enriquecer os comandos
const COMMAND_METADATA: Record<string, { emoji: string; category: string }> = {
    help: { emoji: "🌌", category: "Sistema" },
    ping: { emoji: "🏓", category: "Diagnóstico" },
    counter: { emoji: "🔢", category: "Exemplo V2" },
};

createCommand({
    name: "help",
    description: "Central de auxílio e comandos do Vantinha 🌌",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        // Busca dinâmica de todos os comandos registrados na aplicação Discord
        let appCommands = interaction.client.application.commands.cache;
        if (appCommands.size === 0) {
            appCommands = await interaction.client.application.commands.fetch().catch(() => appCommands);
        }

        const chatCommands = appCommands.filter(
            (cmd) => cmd.type === ApplicationCommandType.ChatInput
        );

        // Monta a listagem dinâmica de comandos
        const commandLines: string[] = [];

        if (chatCommands.size > 0) {
            for (const cmd of chatCommands.values()) {
                const meta = COMMAND_METADATA[cmd.name] ?? { emoji: "⚡", category: "Geral" };
                const desc = cmd.description || "Comando do sistema Vanta.";
                commandLines.push(`• ${meta.emoji} **\`/${cmd.name}\`** — ${desc}`);
            }
        } else {
            // Fallback de segurança caso a API do Discord oscile
            commandLines.push(
                "• 🌌 **`/help`** — Central de auxílio e comandos do Vantinha.",
                "• 🏓 **`/ping`** — Analisa a latência do gateway Discord e tempo de resposta.",
                "• 🔢 **`/counter`** — Contador interativo com persistência em Components V2."
            );
        }

        const totalCmds = chatCommands.size > 0 ? chatCommands.size : 3;

        const container = createContainer(
            constants.colors.vantaAccent,
            createSection(
                `# 🌌 Central de Comandos • Vantinha\nEu sou o assistente oficial do ecossistema **Vanta**, operando em alta frequência com interface moderna **Discord Components V2**.`,
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
                "### 🛰️ Arquitetura & Status do Cluster\n" +
                "• **Base:** Constatic Framework (TypeScript ESM Puro)\n" +
                "• **UI Discord:** 100% Discord Components V2 Exclusivo\n" +
                "• **API Web:** Fastify na porta `8080` com E2E AES-256-GCM\n" +
                "• **Persistência:** Google Cloud Firestore (`vantinha-e9fca`)"
            ),
            Separator.Hidden,
            createTextDisplay("💡 *Dica: Novos comandos criados no bot aparecem automaticamente nesta central.*")
        );

        await interaction.reply({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container],
        } satisfies InteractionReplyOptions);
    },
});
