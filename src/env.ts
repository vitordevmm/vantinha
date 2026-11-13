import { validateEnv } from "@constatic/base";
import { z } from "zod";
import "./constants.js";

export const env = await validateEnv(z.object({
    BOT_TOKEN: z.string({ required_error: "Discord Bot Token is required" }).min(1),
    BOT_ID: z.string().optional().default("1567751920645308548"),
    FIREBASE_PATH: z.string().default("./firebase.json"),
    SERVER_PORT: z.coerce.number().min(1).default(8080),
    DASHBOARD_URL: z.string().default("http://localhost:3000"),
    API_SECRET_KEY: z.string().default("vanta_secret_token_dev"),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    GUILD_ID: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development")
}).passthrough());
