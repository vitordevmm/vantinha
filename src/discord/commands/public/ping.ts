import { createCommand } from "#base";
import { createContainer, createDate, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

createCommand({
    name: "ping",
    description: "Verifica a latência do Vantinha 🏓",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const pingMs = Math.abs(Date.now() - interaction.createdTimestamp);
        const wsPing = interaction.client.ws.ping;
        const now = createDate();

        const container = createContainer(
            constants.colors.vantaAccent,
            createSection(
                `### 🏓 Pong! Latência do Vantinha\n- **Gateway WS:** \`${wsPing}ms\`\n- **Interação:** \`${pingMs}ms\``,
                new ButtonBuilder({
                    customId: `remind/${now.toISOString()}`,
                    style: ButtonStyle.Primary,
                    label: "Registrar Ponto",
                    emoji: "⏱️"
                })
            ),
            Separator.Default,
            createTextDisplay("🌌 **Vantinha** operando em tempo real com alta performance e estabilidade.")
        );

        await interaction.reply({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container]
        } satisfies InteractionReplyOptions);
    }
});
