<div align="center">

# 🌌 Vantinha — Official Bot of the Vanta Ecosystem

<p align="center">
  <b>High-performance intelligent assistant, security gateway, verification system, and official automation for Vanta.</b>
</p>

<p align="center">
  <a href="README.md"><b>🇧🇷 Português</b></a> •
  <a href="README.en.md"><b>🇺🇸 English</b></a> •
  <a href="README.es.md"><b>🇪🇸 Español</b></a>
</p>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Constatic](https://img.shields.io/badge/Constatic-Base%200.1.3-7c3aed?style=for-the-badge&logo=rocket&logoColor=white)](https://constatic-docs.vercel.app/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14.18+-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Components V2](https://img.shields.io/badge/UI-Components%20V2%20Only-E5A93C?style=for-the-badge&logo=sparkles&logoColor=black)](https://github.com/magicyan/discord)
[![Fastify](https://img.shields.io/badge/API-Fastify%205+-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Firestore](https://img.shields.io/badge/Database-Cloud%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/Security-AES--256--GCM%20E2E-06b6d4?style=for-the-badge&logo=shield&logoColor=white)](#-security-layer--e2e-encryption)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Anti--Plagiarism-red?style=for-the-badge&logo=lock&logoColor=white)](LICENSE)

---

</div>

## 📖 Overview

**Vantinha** is the central backbone of **Vanta's** Discord ecosystem. Built on a modern **pure TypeScript ESM** architecture using the **Constatic** framework, it was engineered to operate as a robust **Master Data Gateway** between Discord, cloud persistence, and Vanta's web dashboard.

Featuring a visual user interface **100% powered by Discord Components V2** and secure end-to-end communication encrypted with **AES-256-GCM**, Vantinha combines anti-raid intrusion protection, community automation, and seamless telemetry synchronization.

---

## ⚡ Key Features

### 🛡️ Advanced Verification System & Member Security Gateway
- **Native Web Integration**: Bot-generated interactive panels issue temporary 15-minute single-use tokens (`/verify?token=...`) for external browser-based challenge completion and network auditing.
- **Global Alternate Account (Alt) Detection**: Scans connection history and automatically correlates IPs to track duplicate accounts across servers bidirectionally.
- **VPN & Proxy Detection**: Automatic mitigation (kick, ban, or flag) against suspicious anonymous IP addresses.
- **Real-Time Audit Logging**: Comprehensive logs of every verification attempt, IP hash, User-Agent, and sanction recorded in dedicated staff channels.

### 🎨 Supreme UI Law: 100% Discord Components V2
- Vantinha **completely abolishes legacy Discord Embeds and standalone ActionRows**.
- Every single message, modal, and command response is built using `createContainer`, `createSection`, `Separator`, `createTextDisplay`, and the official `MessageFlags.IsComponentsV2`.
- Strict branded styling based on the **Vantablack & Vanta Gold** design palette (`#E5A93C`, `#0a0a0c`, `#7c3aed`).

### 🎭 Official Custom Emoji System
- Features an integrated catalog of **59 official custom brand emojis** registered from `vh.dog` (identity, status, diagnostic, security, moderation, navigation, and controls).
- Strictly bans generic Unicode emojis across all system interfaces, enforcing visual consistency.

### 🌐 Master Data Gateway (Integrated Fastify REST API)
- High-throughput, low-latency HTTP server integrated directly into the bot lifecycle on `clientReady`.
- The dashboard web application **never accesses raw database schemas directly**: the bot is the Single Source of Truth.
- Comprehensive REST endpoints for overview metrics (`/api/dashboard/overview`), OAuth login telemetry sync (`/api/users/sync`), paginated user directories (`/api/users`), live enriched dossiers (`/api/users/:userId`), and remote moderation actions (`kick`, `ban`, `unban`).

### 🔒 Security Layer & E2E Encryption (AES-256-GCM)
- Sensitive payloads between the dashboard and the bot API are packaged in cryptographic envelopes:
  $$\text{Envelope} = \{ \text{iv}, \text{authTag}, \text{data} \}$$
- Out-of-the-box protection against transit tampering, eavesdropping, replay attacks, and unauthorized request spoofing.

### 🔄 Dynamic Command Auto-Discovery (`/help`)
- The interactive help center automatically discovers newly registered slash commands in memory without requiring manual UI rewrites, maintaining live-synced documentation.

---

## 🏗️ Technology Stack & Architecture

```
Vanta Bot/
├── src/
│   ├── index.ts               # Constatic bootstrap & entrypoint
│   ├── env.ts                 # Strict environment variable validation via Zod
│   ├── constants.ts           # Design tokens, color palette, and emoji injections
│   ├── database/              # Google Cloud Firestore persistence via Typesaurus
│   │   ├── index.ts           # Firebase Admin SDK initialization
│   │   ├── documents/         # Typed schemas (GuildDocument, UserDocument, MemberDocument)
│   │   └── functions/         # Business logic (users, verification, guilds, members)
│   ├── discord/               # Auto-loaded Constatic modules
│   │   ├── commands/          # Slash commands (/help, /ping, /counter) in Components V2
│   │   ├── responders/        # Button listeners with radix rou3 routing
│   │   └── events/            # Rotating rich presence and system loggers
│   ├── functions/             # Global utility functions
│   │   ├── crypto.ts          # AES-256-GCM encryption engine & authenticated envelopes
│   │   ├── emojis.ts          # Custom emoji catalog and retrieval helpers
│   │   └── verification.ts    # V2 panels and temporary OAuth session management
│   └── server/                # Integrated Fastify API server
│       ├── index.ts           # Server bootstrap on clientReady
│       └── routes/            # Modular routes (home, verification, users, dashboard)
├── constants.json             # Immutable color tokens & custom emoji definitions
├── LICENSE                    # Proprietary & Anti-Plagiarism Software License
├── PROJECT_STATE.md           # Continuous state memory and project ledger
└── tsconfig.json              # Strict TypeScript config with subpath aliases (#)
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Base Framework** | `@constatic/base` + `@magicyan/discord` | Modular architecture, radix routing, and Discord Components V2 |
| **Execution Engine** | Node.js 22+ / TypeScript 5.7+ | Native ESM with subpath imports (`#database`, `#functions`, `#env`, etc.) |
| **Database** | Google Cloud Firestore + `typesaurus` | Cloud NoSQL persistence with end-to-end strong typing |
| **Web API Server** | Fastify 5+ | High-speed bidirectional communication with the web dashboard |
| **Cryptography** | AES-256-GCM (`node:crypto`) | Authenticated encryption with associated data (AEAD) envelopes |
| **Validation** | Zod 3 | Fail-fast schema validation for contracts and environment variables |

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** 22.0.0 or higher installed.
- Firebase Service Account key file (`serviceAccount.json` or `firebase.json`) with Cloud Firestore enabled.
- Discord Application & Bot configured in the [Discord Developer Portal](https://discord.com/developers/applications).

### 1. Clone the Repository
```bash
git clone https://github.com/vitordevmm/vantinha.git
cd vantinha
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file based on [.env.example](file:///.env.example):
```env
# Discord Credentials
BOT_TOKEN="YOUR_DISCORD_BOT_TOKEN"
BOT_ID="1567751920645308548"

# Firestore Database (Service Account JSON path)
FIREBASE_PATH="./serviceAccount.json"

# API Server Config (Fastify)
SERVER_PORT=8080

# Dashboard & API Security (Master Keys)
DASHBOARD_URL="http://localhost:3000"
API_SECRET_KEY="your_secret_api_key"
API_ENCRYPTION_KEY="your_aes256_encryption_key"

NODE_ENV="development"
```

> ⚠️ **Important:** The `.env`, `firebase.json`, and `serviceAccount.json` files are protected by `.gitignore` and **must never** be committed.

### 4. Verify Syntax & Types
```bash
npm run check
```

### 5. Start Development Server (Native Watch Mode)
```bash
npm run dev
```
Vantinha will launch with native hot-reload, tracking `./src` changes, authenticating with Firestore, and binding Fastify to the configured port.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the bot in development mode with native hot-reload (`node --watch`) |
| `npm run check` | Runs TypeScript typechecker (`tsc --noEmit`) to ensure zero errors |
| `npm run build` | Compiles TypeScript source files into pure JavaScript in `/build` |
| `npm start` | Launches the compiled bot in production mode |

---

## 🔒 Governance & Project Ledger

Development strictly adheres to the protocol defined in [PROJECT_STATE.md](file:///PROJECT_STATE.md):
1. Pre-reading conventions and state before modifications.
2. Pre-startup validation using `npm run check` with 0 errors.
3. Active log inspection during the first 10 seconds of startup.
4. Documenting updates incrementally (`[Update #XXX]`) with detailed modified file lists.
5. Strict enforcement of the **Supreme UI Law: 100% Discord Components V2**, the **Backend Privacy Law** (zero internal infrastructure leakage to users), and the **Custom Emoji Law**.

---

## ⚖️ License & Intellectual Property (Anti-Plagiarism)

This project is protected under a **Strict Proprietary and Anti-Plagiarism License** (`ALL RIGHTS RESERVED`).
- **Copyright (c) 2026 Vitor Dev (vitordevmm) & Vanta Ecosystem**.
- It is **strictly forbidden** to copy, plagiarize, reproduce, redistribute, sub-license, or commercialize any part of this code, architectural design, or visual assets under another name without prior explicit written consent from the author.
- Source code is publicly available solely for transparency, portfolio review, and security auditing purposes.
- For complete legal terms, review the [LICENSE](LICENSE) file.

---

<div align="center">
  <sub>Engineered with excellence for the <b>Vanta</b> ecosystem.</sub>
</div>
