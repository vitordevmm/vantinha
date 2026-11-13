/**
 * Catálogo e utilitários para Emojis Personalizados Oficiais do Vanta
 */

export type VantaEmojiName = keyof typeof constants.emojis;

/**
 * Retorna o emoji personalizado formatado para texto/markdown (<:nome:id>)
 */
export function getEmoji(name: VantaEmojiName): string {
    return constants.emojis[name] ?? "⚡";
}

/**
 * Extrai o ID numérico (snowflake) do emoji personalizado para uso em botões e menus
 */
export function getEmojiId(name: VantaEmojiName): string {
    const mention = constants.emojis[name];
    if (!mention) return "";
    const match = mention.match(/:(\d+)>/);
    return match ? match[1] : "";
}

/**
 * Lista de todos os 59 emojis oficiais disponíveis no ecossistema Vanta
 */
export const AVAILABLE_EMOJIS = Object.keys(constants.emojis) as VantaEmojiName[];
