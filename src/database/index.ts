import { env } from "#env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import fs from "node:fs";
import ck from "chalk";
import { schema, type Typesaurus } from "typesaurus";
import type { GuildDocument } from "./documents/GuildDocument.js";
import type { MemberDocument } from "./documents/MemberDocument.js";
import type { UserDocument } from "./documents/UserDocument.js";

const candidatePaths = [
    env.FIREBASE_PATH,
    "./firebase.json",
    "./serviceAccount.json"
].filter(Boolean);

const resolvedPath = candidatePaths.find(p => fs.existsSync(p));

if (getApps().length === 0 && resolvedPath) {
    try {
        const accountFile = fs.readFileSync(resolvedPath, { encoding: "utf-8" });
        const credentials = JSON.parse(accountFile);
        if (credentials.private_key && credentials.private_key.includes("BEGIN PRIVATE KEY")) {
            initializeApp({
                credential: cert(credentials)
            });
            console.log(ck.green(`● Firebase Firestore initialized successfully (Project: ${credentials.project_id || "vantinha-e9fca"})`));
        } else {
            console.log(ck.yellow("⚠ Firebase placeholder key detected in credentials file. Configure your service account to connect Firestore."));
        }
    } catch (error) {
        console.error(ck.red("✖ Failed to load Firebase credentials:"), error);
    }
} else if (getApps().length === 0) {
    console.log(ck.yellow("⚠ Firebase credentials file not found. Place firebase.json or serviceAccount.json in root."));
}

export const db = schema(({ collection }) => ({
    guilds: collection<GuildDocument>().sub({
        members: collection<MemberDocument>()
    }),
    users: collection<UserDocument>()
}));

export type DatabaseSchema = Typesaurus.Schema<typeof db>;
export type MemberSchema = DatabaseSchema["guilds"]["sub"]["members"]["Data"];
export type GuildSchema = DatabaseSchema["guilds"]["Data"];
export type UserSchema = DatabaseSchema["users"]["Data"];

export * from "./functions/guilds.js";
export * from "./functions/members.js";
export * from "./functions/verification.js";
export * from "./functions/users.js";
export type { UserDocument } from "./documents/UserDocument.js";
