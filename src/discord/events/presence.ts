import { createEvent } from "#base";
import { ActivityType, type Client } from "discord.js";

createEvent({
    name: "Vantinha Presence Rotator",
    event: "clientReady",
    once: true,
    async run(client: Client<true>) {
        let currentIndex = 0;

        const updatePresence = () => {
            const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalGuilds = client.guilds.cache.size;

            const activities = [
                {
                    name: `Ventando ecos sobre ${totalMembers.toLocaleString("pt-BR")} almas no Vanta`,
                    type: ActivityType.Custom,
                    state: `🌪️ Ventando ecos sobre ${totalMembers.toLocaleString("pt-BR")} membros no Vanta`
                },
                {
                    name: "Dúvidas sobre o cluster? Consulte /help",
                    type: ActivityType.Playing,
                    state: "⚡ Dúvidas sobre o cluster? Consulte /help"
                },
                {
                    name: `Vigilante no ecossistema Vanta (${totalGuilds} cluster ativo)`,
                    type: ActivityType.Watching,
                    state: `🌌 Vigilante em ${totalGuilds} servidor(es) do Vanta`
                },
                {
                    name: "Sussurros na frequência do Vanta",
                    type: ActivityType.Listening,
                    state: "📡 Sintonizado no núcleo Vanta"
                }
            ];

            const current = activities[currentIndex % activities.length];
            client.user.setPresence({
                status: "online",
                activities: [current]
            });

            currentIndex++;
        };

        // Aplica o primeiro status de imediato
        updatePresence();

        // Alterna dinamicamente a cada 20 segundos
        setInterval(updatePresence, 20_000);
    }
});
