import { createCommand, createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import {
    createContainer,
    createModalInput,
    createSection,
    createTextDisplay,
    Separator,
} from "@magicyan/discord";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputStyle,
    type InteractionReplyOptions,
} from "discord.js";

/**
 * Formata números com precisão e sem dízimas infinitas
 */
function formatNumber(num: number): string {
    if (!Number.isFinite(num)) return "0";
    if (Number.isInteger(num)) return num.toString();
    return Number(num.toFixed(4)).toString();
}

/**
 * Avaliador seguro de expressões matemáticas com whitelist estrita
 */
function safeEvaluate(expr: string): number {
    const sanitized = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/,/g, ".");

    if (!/^[0-9+\-*/%().\s]+$/.test(sanitized)) {
        throw new Error("Caracteres não numéricos detectados na expressão.");
    }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const result = Function(`"use strict"; return (${sanitized});`)();
    if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
        throw new Error("Resultado inválido.");
    }
    return result;
}

/**
 * Montador de tela da Calculadora Vantinha em Discord Components V2
 */
function calculatorMenu<R>(current: number, lastOp?: string): R {
    const formattedVal = formatNumber(current);

    const elements: any[] = [
        createSection(
            `## ${constants.emojis.coins} Calculadora Vantinha: \` ${formattedVal} \``,
            new ButtonBuilder({
                customId: "calc/reset",
                label: "Resetar",
                emoji: constants.emojis.repitaoutroca,
                disabled: current === 0 && !lastOp,
                style: current > 0 ? ButtonStyle.Primary : current < 0 ? ButtonStyle.Danger : ButtonStyle.Secondary,
            })
        ),
    ];

    if (lastOp) {
        elements.push(
            Separator.Default,
            createTextDisplay(`*${constants.emojis.relogio} Histórico recente: \`${lastOp}\`*`)
        );
    }

    elements.push(
        Separator.Default,
        createSection(
            "Adicionar valor (+)\nSome um número ao total atual.",
            new ButtonBuilder({
                customId: `calc/btn/add/${formattedVal}`,
                label: "+",
                emoji: constants.emojis.mais,
                style: ButtonStyle.Success,
            })
        ),
        createSection(
            "Subtrair valor (-)\nSubtraia um número do total atual.",
            new ButtonBuilder({
                customId: `calc/btn/sub/${formattedVal}`,
                label: "-",
                emoji: constants.emojis.menos,
                style: ButtonStyle.Danger,
            })
        ),
        createSection(
            "Multiplicar valor (×)\nMultiplique o total atual por um fator.",
            new ButtonBuilder({
                customId: `calc/btn/mul/${formattedVal}`,
                label: "×",
                style: ButtonStyle.Primary,
            })
        ),
        createSection(
            "Dividir valor (÷)\nDivida o total atual por um divisor.",
            new ButtonBuilder({
                customId: `calc/btn/div/${formattedVal}`,
                label: "÷",
                style: ButtonStyle.Primary,
            })
        ),
        createSection(
            "Calcular porcentagem (%)\nCalcule a porcentagem sobre o total atual.",
            new ButtonBuilder({
                customId: `calc/btn/pct/${formattedVal}`,
                label: "%",
                style: ButtonStyle.Secondary,
            })
        ),
        createSection(
            "Definir valor direto\nInsira um número ou valor inicial.",
            new ButtonBuilder({
                customId: `calc/btn/set/${formattedVal}`,
                label: "Definir",
                emoji: constants.emojis.edit,
                style: ButtonStyle.Secondary,
            })
        )
    );

    const container = createContainer(constants.colors.vantaAccent, ...elements);

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container],
    } satisfies InteractionReplyOptions) as R;
}

// ==========================================
// 1. Comando Slash /calculadora
// ==========================================
createCommand({
    name: "calculadora",
    description: "Calculadora interativa oficial do Vantinha (+, -, ×, ÷, %) 🔢",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "valor",
            description: "Valor inicial para iniciar os cálculos (opcional)",
            type: ApplicationCommandOptionType.Number,
            required: false,
        },
        {
            name: "expressao",
            description: "Expressão matemática direta para calcular (ex: 50 + 20 * 2 ou 100 * 15%)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    async run(interaction) {
        const initialVal = interaction.options.getNumber("valor");
        const expr = interaction.options.getString("expressao");

        let startValue = 0;
        let lastOp: string | undefined;

        if (typeof initialVal === "number" && !Number.isNaN(initialVal)) {
            startValue = initialVal;
            lastOp = `Iniciado com ${formatNumber(startValue)}`;
        } else if (expr) {
            try {
                startValue = safeEvaluate(expr);
                lastOp = `${expr} = ${formatNumber(startValue)}`;
            } catch {
                lastOp = `Erro na expressão: ${expr}`;
            }
        }

        await interaction.reply(calculatorMenu(startValue, lastOp));
    },
});

// ==========================================
// 2. Responder do Botão Resetar
// ==========================================
createResponder({
    customId: "calc/reset",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        await interaction.update(calculatorMenu(0, "Calculadora resetada para 0"));
    },
});

// ==========================================
// 3. Responder dos Botões de Operação (Abre Modal)
// ==========================================
createResponder({
    customId: "calc/btn/:operation/:current",
    types: [ResponderType.Button],
    cache: "cached",
    parse: (params) => ({
        operation: params.operation,
        current: Number.parseFloat(params.current) || 0,
    }),
    async run(interaction, { operation, current }) {
        const opMeta: Record<string, { title: string; label: string; placeholder: string }> = {
            add: {
                title: "➕ Somar (+)",
                label: `Valor a somar ao número ${formatNumber(current)}:`,
                placeholder: "Ex: 10, 50, 2.5 (padrão: 1)",
            },
            sub: {
                title: "➖ Subtrair (-)",
                label: `Valor a subtrair do número ${formatNumber(current)}:`,
                placeholder: "Ex: 5, 20, 1.5 (padrão: 1)",
            },
            mul: {
                title: "✖️ Multiplicar (×)",
                label: `Multiplicar ${formatNumber(current)} por:`,
                placeholder: "Ex: 2, 5, 10, 0.5 (padrão: 2)",
            },
            div: {
                title: "➗ Dividir (÷)",
                label: `Dividir ${formatNumber(current)} por:`,
                placeholder: "Ex: 2, 4, 10 (padrão: 2)",
            },
            pct: {
                title: "% Porcentagem (%)",
                label: `Porcentagem sobre ${formatNumber(current)} (%):`,
                placeholder: "Ex: 20 (para 20%), 50, 15",
            },
            set: {
                title: "✏️ Definir Valor Inicial",
                label: "Digite o novo número para a calculadora:",
                placeholder: "Ex: 100, 250, 0",
            },
        };

        const meta = opMeta[operation] ?? {
            title: "Operação Matemática",
            label: "Digite o valor numérico:",
            placeholder: "Ex: 10",
        };

        const modal = new ModalBuilder({
            customId: `calc/modal/${operation}/${formatNumber(current)}`,
            title: meta.title,
            components: [
                createModalInput({
                    customId: "value",
                    label: meta.label,
                    style: TextInputStyle.Short,
                    placeholder: meta.placeholder,
                    required: operation === "pct" || operation === "set",
                }),
            ],
        });

        await interaction.showModal(modal);
    },
});

// ==========================================
// 4. Responder da Submissão de Modal
// ==========================================
createResponder({
    customId: "calc/modal/:operation/:current",
    types: [ResponderType.Modal],
    cache: "cached",
    parse: (params) => ({
        operation: params.operation,
        current: Number.parseFloat(params.current) || 0,
    }),
    async run(interaction, { operation, current }) {
        const rawInput = interaction.fields.getTextInputValue("value")?.trim().replace(/,/g, ".") || "";

        let inputNum = Number.parseFloat(rawInput);
        if (Number.isNaN(inputNum)) {
            // Valores padrão intuitivos caso o usuário envie em branco
            if (operation === "add" || operation === "sub") inputNum = 1;
            else if (operation === "mul" || operation === "div") inputNum = 2;
            else inputNum = 0;
        }

        let newResult = current;
        let history = "";

        switch (operation) {
            case "add": {
                newResult = current + inputNum;
                history = `${formatNumber(current)} + ${formatNumber(inputNum)} = ${formatNumber(newResult)}`;
                break;
            }
            case "sub": {
                newResult = current - inputNum;
                history = `${formatNumber(current)} - ${formatNumber(inputNum)} = ${formatNumber(newResult)}`;
                break;
            }
            case "mul": {
                newResult = current * inputNum;
                history = `${formatNumber(current)} × ${formatNumber(inputNum)} = ${formatNumber(newResult)}`;
                break;
            }
            case "div": {
                if (inputNum === 0) {
                    newResult = current;
                    history = "Erro: Divisão por zero não é permitida!";
                } else {
                    newResult = current / inputNum;
                    history = `${formatNumber(current)} ÷ ${formatNumber(inputNum)} = ${formatNumber(newResult)}`;
                }
                break;
            }
            case "pct": {
                newResult = current * (inputNum / 100);
                history = `${formatNumber(inputNum)}% de ${formatNumber(current)} = ${formatNumber(newResult)}`;
                break;
            }
            case "set": {
                newResult = inputNum;
                history = `Valor definido para ${formatNumber(newResult)}`;
                break;
            }
            default: {
                newResult = current;
                history = "Operação desconhecida";
            }
        }

        if (interaction.isFromMessage()) {
            await interaction.update(calculatorMenu(newResult, history));
        } else {
            await interaction.reply(calculatorMenu(newResult, history));
        }
    },
});
