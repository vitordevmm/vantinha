import type { Client } from "discord.js";
import type { FastifyInstance } from "fastify";
import { homeRoute } from "./home.js";
import { verificationRoutes } from "./verification.js";

export function registerRoutes(app: FastifyInstance, client: Client<true>) {
    homeRoute(app, client);
    verificationRoutes(app, client);
}
