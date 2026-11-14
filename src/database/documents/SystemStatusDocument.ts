export interface SystemStatusDocument {
    id: string; // "bot_status"
    updatedAt: string; // ISO
    nextUpdateAt: string; // ISO
    intervalMinutes: number; // 60
    bot: {
        id: string;
        username: string;
        tag: string;
        name: string;
        avatar: string | null;
        status: "online" | "idle" | "dnd" | "offline";
    };
    guilds: {
        total: number;
        list: Array<{
            id: string;
            name: string;
            icon: string | null;
            memberCount: number;
            channelsCount: number;
            rolesCount: number;
        }>;
    };
    members: {
        total: number;
        cached: number;
    };
    channels: {
        total: number;
        text: number;
        voice: number;
        categories: number;
    };
    network: {
        wsPingMs: number;
        status: number;
    };
    uptime: {
        processSeconds: number;
        formatted: string;
        startedAt: string;
    };
    security: {
        totalUsers: number;
        totalVerified: number;
        totalFlagged: number;
        totalBanned: number;
        totalAlts: number;
        totalVpn: number;
        activeVerificationSessions: number;
    };
    commands: {
        total: number;
        names: string[];
    };
    system: {
        nodeVersion: string;
        platform: string;
        arch: string;
        memoryRssMb: number;
        memoryHeapUsedMb: number;
        memoryHeapTotalMb: number;
    };
}
