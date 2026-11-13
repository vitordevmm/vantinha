import type { Client } from "discord.js";
import type { FastifyInstance } from "fastify";
import { homeRoute } from "./home.js";
import { verificationRoutes } from "./verification.js";
import { usersRoutes } from "./users.js";
import { dashboardRoutes } from "./dashboard.js";

export function registerRoutes(app: FastifyInstance, client: Client<true>) {
    homeRoute(app, client);
    verificationRoutes(app, client);
    usersRoutes(app, client);
    dashboardRoutes(app, client);
}
