import { createCommand } from "#base";
import { createContainer, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

createCommand({
    name: "help",
    description: "Central de auxílio e comandos do Vantinha 🌌",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const container = createContainer(
            constants.colors.vantaAccent,
            createSection(
                `# 🌌 Central de Comandos • Vantinha\nEu sou o assistente oficial do ecossistema **Vanta**, operando em alta frequência com interface moderna **Discord Components V2**.`,
                new ButtonBuilder({
                    customId: "help/refresh",
                    label: "Atualizado",
                    style: ButtonStyle.Secondary,
                    disabled: true,
                    emoji: "✨"
                })
            ),
            Separator.Default,
            createTextDisplay(
                "### 📜 Comandos Disponíveis\n" +
                "• **`/help`** — Exibe este portal de comandos e orientações do cluster.\n" +
                "• **`/ping`** — Analisa a latência do gateway Discord e tempo de resposta da API.\n" +
                "• **`/counter`** — Contador interativo com persistência de estado em Components V2."
            ),
            Separator.Default,
            createTextDisplay(
                "### 🛰️ Arquitetura & Status\n" +
                "• **Base:** Constatic Framework (TypeScript ESM Puro)\n" +
                "• **UI:** 100% Discord Components V2\n" +
                "• **API Web:** Fastify rodando na porta `8080`\n" +
                "• **Persistência:** Firestore Database"
            ),
            Separator.Hidden,
            createTextDisplay("Precisa de auxílio técnico adicional? Fale com a equipe do Vanta.")
        );

        await interaction.reply({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container]
        } satisfies InteractionReplyOptions);
    }
});
