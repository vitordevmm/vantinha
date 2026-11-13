import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { createContainer, createSection, createTextDisplay, Separator } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, time, type InteractionReplyOptions } from "discord.js";
import { z } from "zod";

const schema = z.object({
    date: z.string().transform(str => new Date(str)),
});

createResponder({
    customId: "remind/:date",
    types: [ResponderType.Button],
    cache: "cached",
    parse: schema.parse,
    async run(interaction, { date }) {
        const container = createContainer(
            constants.colors.success,
            createSection(
                `### ⏱️ Ponto Registrado!\nComando executado ${time(date, "R")} (${time(date, "F")}).`,
                new ButtonBuilder({
                    customId: "remind/confirm",
                    label: "Confirmado",
                    style: ButtonStyle.Success,
                    disabled: true,
                    emoji: "✅"
                })
            ),
            Separator.Default,
            createTextDisplay("Operação concluída com sucesso no cluster Vanta.")
        );

        await interaction.reply({
            flags: ["Ephemeral", "IsComponentsV2"],
            components: [container]
        } satisfies InteractionReplyOptions);
    },
});
