import { env } from "#env";
import crypto from "node:crypto";

export interface EncryptedEnvelope {
    iv: string;       // 12 bytes em hex (padrão GCM)
    authTag: string;  // 16 bytes em hex (tag de autenticação GCM)
    data: string;     // Dados criptografados em hex
}

// Deriva deterministicamente uma chave de 256 bits (32 bytes) a partir da chave configurada no .env
function getCipherKey(): Buffer {
    return crypto.createHash("sha256").update(env.API_ENCRYPTION_KEY).digest();
}

/**
 * Criptografa qualquer payload JavaScript em um envelope autenticado AES-256-GCM
 */
export function encryptData<T = unknown>(payload: T): EncryptedEnvelope {
    const key = getCipherKey();
    const iv = crypto.randomBytes(12); // 96-bit IV recomendado para AES-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const serialized = JSON.stringify(payload);
    let encrypted = cipher.update(serialized, "utf-8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
        data: encrypted,
    };
}

/**
 * Descriptografa um envelope AES-256-GCM verificando a autenticidade e integridade
 */
export function decryptData<T = unknown>(envelope: EncryptedEnvelope): T {
    if (!envelope || !envelope.iv || !envelope.authTag || !envelope.data) {
        throw new Error("Envelope criptográfico inválido ou incompleto (iv, authTag e data são obrigatórios).");
    }

    const key = getCipherKey();
    const iv = Buffer.from(envelope.iv, "hex");
    const authTag = Buffer.from(envelope.authTag, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(envelope.data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return JSON.parse(decrypted) as T;
}

/**
 * Verifica se um objeto possui a assinatura de um envelope criptográfico
 */
export function isEncryptedEnvelope(value: unknown): value is EncryptedEnvelope {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.iv === "string" &&
        typeof candidate.authTag === "string" &&
        typeof candidate.data === "string"
    );
}

/**
 * Tentativa segura de descriptografar payload: retorna os dados ou erro claro
 */
export function safeDecryptPayload<T = unknown>(
    body: unknown
): { success: true; data: T } | { success: false; error: string } {
    if (!isEncryptedEnvelope(body)) {
        return {
            success: false,
            error: "Payload da requisição não está no formato criptográfico esperado { iv, authTag, data }.",
        };
    }

    try {
        const decrypted = decryptData<T>(body);
        return { success: true, data: decrypted };
    } catch (err) {
        return {
            success: false,
            error: "Falha na descriptografia da mensagem: chave inválida ou adulteração no trânsito.",
        };
    }
}
