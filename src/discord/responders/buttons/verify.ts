import { createResponder } from "#base";
import { env } from "#env";
import { createVerificationSession } from "#functions";
import { ResponderType } from "@constatic/base";
import { createContainer, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

createResponder({
    customId: "verification/start",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        const token = createVerificationSession(interaction.guild.id, interaction.user.id);
        const verifyUrl = `${env.DASHBOARD_URL}/verify?token=${token}&guild=${interaction.guild.id}`;

        const container = createContainer(
            constants.colors.vantaAccent,
            createSection(
                `# 🛡️ Portal de Verificação Vanta\nOlá, **${interaction.user.displayName}**!\nPara liberar sua conta no servidor, acesse nosso portal seguro e confirme sua identidade.`,
                new ButtonBuilder({
                    style: ButtonStyle.Link,
                    label: "Completar Verificação",
                    url: verifyUrl,
                    emoji: "🚀"
                })
            ),
            Separator.Default,
            createTextDisplay(
                "🔒 **Auditoria Ativa:** A análise de rede e integridade de IP será executada pelo portal.\n" +
                "⏱️ **Validade:** Este link é único para você e expira em **15 minutos**."
            ),
            Separator.Hidden,
            createTextDisplay("Nunca compartilhe este link com terceiros.")
        );

        await interaction.reply({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container]
        } satisfies InteractionReplyOptions);
    }
});
