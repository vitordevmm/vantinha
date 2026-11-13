import type { Client } from "discord.js";
import type { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

export function homeRoute(app: FastifyInstance, client: Client<true>) {
    app.get("/", (_, res) => {
        return res.status(StatusCodes.OK).send({
            status: "online",
            bot: {
                id: client.user.id,
                username: client.user.username,
                name: constants.bot.name,
            },
            stats: {
                guilds: client.guilds.cache.size,
                users: client.users.cache.size,
                uptime: process.uptime(),
            },
            timestamp: new Date().toISOString(),
        });
    });

    // Lista todas as guildas em que o bot está presente para o seletor do dashboard
    app.get("/api/guilds", (_, res) => {
        const guilds = client.guilds.cache.map(g => ({
            id: g.id,
            name: g.name,
            icon: g.iconURL() ?? null,
            memberCount: g.memberCount,
        }));

        return res.status(StatusCodes.OK).send({ guilds });
    });
}
