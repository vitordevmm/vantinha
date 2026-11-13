export interface UserVerificationRecord {
    guildId: string;
    guildName?: string;
    verifiedAt: string;
    ip: string;
    isVpn: boolean;
    userAgent?: string;
    fingerprint?: string;
    altAccounts?: string[];
    actionTaken: "verified" | "blocked" | "flagged" | "kicked" | "banned";
    reason?: string;
}

export interface UserDocument {
    userId: string;
    username: string;
    displayName: string;
    globalName?: string;
    avatar?: string;
    accountCreatedAt: string; // ISO
    accountAgeDays: number;
    firstSeenAt: string; // ISO
    lastSeenAt: string; // ISO
    lastIp: string;
    knownIps: string[];
    knownUserAgents: string[];
    isVpnUser: boolean;
    altAccounts: string[];
    status: "active" | "flagged" | "banned";
    flagReason?: string;
    verifications: Record<string, UserVerificationRecord>; // keyed by guildId
    joinedServerAt?: string;
    fingerprint?: string;
}

export type { UserDocument as default };
