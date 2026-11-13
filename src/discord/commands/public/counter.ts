import { createCommand, createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { createContainer, createSection, Separator } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";

createCommand({
    name: "counter",
    description: "Comando contador demonstrando Discord Components V2 🔢",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.reply(counterMenu(0));
    }
});

createResponder({
    customId: "counter/:current",
    types: [ResponderType.Button],
    cache: "cached",
    parse: params => ({
        current: Number.parseInt(params.current)
    }),
    async run(interaction, { current }) {
        await interaction.update(
            counterMenu(current)
        );
    },
});

function counterMenu<R>(current: number): R {
    const container = createContainer(
        constants.colors.vantaAccent,
        createSection(
            `## 🌌 Contador Vantinha: \` ${current} \``,
            new ButtonBuilder({
                customId: "counter/0",
                label: "Resetar",
                disabled: current === 0,
                style:
                    current > 0 ? ButtonStyle.Primary :
                    current < 0 ? ButtonStyle.Danger :
                    ButtonStyle.Secondary
            }),
        ),
        Separator.Default,
        createSection(
            "Incrementar valor",
            new ButtonBuilder({
                customId: `counter/${current + 1}`,
                label: "+",
                style: ButtonStyle.Success
            }),
        ),
        createSection(
            "Decrementar valor",
            new ButtonBuilder({
                customId: `counter/${current - 1}`,
                label: "-",
                style: ButtonStyle.Danger
            }),
        ),
    );

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}
