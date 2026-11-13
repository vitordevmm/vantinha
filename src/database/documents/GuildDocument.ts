type ChannelInfo = {
    id: string;
    url: string;
};

export interface VerificationSecurityConfig {
    blockAlts: boolean;
    altAction: "block" | "kick" | "ban" | "flag";
    blockVpn: boolean;
    vpnAction: "block" | "flag";
    maxAccountsPerIp: number;
}

export interface VerificationUiConfig {
    title: string;
    description: string;
    accentColor: string;
    buttonLabel: string;
    buttonEmoji: string;
    thumbnailUrl?: string;
    footerText?: string;
}

export interface GuildVerificationConfig {
    enabled: boolean;
    channelId?: string;
    messageId?: string;
    roleId?: string;
    removeRoleId?: string;
    logChannelId?: string;
    security: VerificationSecurityConfig;
    ui: VerificationUiConfig;
}

export interface VerificationLogEntry {
    id: string;
    userId: string;
    username: string;
    userTag: string;
    userAvatar?: string;
    guildId: string;
    verifiedAt: string;
    ip: string;
    isVpn: boolean;
    altDetected: boolean;
    altAccounts?: string[];
    actionTaken: "verified" | "blocked" | "flagged" | "kicked" | "banned";
    reason?: string;
}

interface GuildDocument {
    channels?: {
        logs?: ChannelInfo;
    };
    verification?: GuildVerificationConfig;
    verificationLogs?: VerificationLogEntry[];
}

export type { GuildDocument };
