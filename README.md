<div align="center">

# 🌌 Vantinha — Bot Oficial do Ecossistema Vanta

<p align="center">
  <b>Assistente inteligente de alta performance, gateway de segurança, verificação e automação oficial do Vanta.</b>
</p>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Constatic](https://img.shields.io/badge/Constatic-Base%200.1.3-7c3aed?style=for-the-badge&logo=rocket&logoColor=white)](https://constatic-docs.vercel.app/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14.18+-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Components V2](https://img.shields.io/badge/UI-Components%20V2%20Only-E5A93C?style=for-the-badge&logo=sparkles&logoColor=black)](https://github.com/magicyan/discord)
[![Fastify](https://img.shields.io/badge/API-Fastify%205+-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Firestore](https://img.shields.io/badge/Database-Cloud%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/Security-AES--256--GCM%20E2E-06b6d4?style=for-the-badge&logo=shield&logoColor=white)](#-camada-de-segurança-e-criptografia-e2e)

---

</div>

## 📖 Visão Geral

O **Vantinha** é a espinha dorsal do ecossistema Discord do **Vanta**. Construído sob uma arquitetura moderna em **TypeScript ESM puro** com o framework **Constatic**, ele foi projetado para operar como um **Master Data Gateway** entre o Discord, a nuvem e o futuro dashboard web do Vanta.

Com interface gráfica **100% baseada em Discord Components V2** e comunicação cifrada em **AES-256-GCM**, o Vantinha une proteção contra invasões, automações comunitárias e sincronização contínua de telemetria.

---

## ⚡ Principais Funcionalidades

### 🛡️ Sistema Avançado de Verificação & Gateway de Membros
- **Integração Web Nativa**: Painéis gerados pelo bot enviam links temporários de 15 minutos (`/verify?token=...`) para resolução de desafios e auditoria no site oficial.
- **Detecção Global de Contas Secundárias (Alts)**: Varre o histórico de conexões e cruza IPs automaticamente, vinculando contas alternativas bidirecionalmente.
- **Detecção de VPN & Proxy**: Bloqueio ou sinalização automática de acessos anônimos suspeitos.
- **Auditoria em Tempo Real**: Registro minucioso de cada tentativa, IP, User-Agent e ação aplicada em canais dedicados no Discord.

### 🎨 Lei Suprema de UI: 100% Discord Components V2
- O Vantinha **aboliu completamente Embeds legadas e ActionRows soltas**.
- Todas as mensagens, formulários e comandos utilizam `createContainer`, `createSection`, `Separator`, `createTextDisplay` e a flag oficial `MessageFlags.IsComponentsV2`.
- Paleta visual padronizada com a estética **Vantablack & Vanta Gold** (`#E5A93C`, `#0a0a0c`, `#7c3aed`).

### 🌐 Master Data Gateway (Fastify REST API)
- Servidor HTTP de alta velocidade integrado diretamente no ciclo de vida do bot.
- O site **nunca precisa conhecer os schemas brutos do banco de dados**: o bot é a Fonte Única da Verdade.
- Endpoints completos para métricas gerais (`/api/dashboard/overview`), sincronização de telemetria de login (`/api/users/sync`), diretório paginado (`/api/users`), dossiê com dados ao vivo (`/api/users/:userId`) e moderação (`kick`, `ban`, `unban`).

### 🔒 Criptografia Ponta a Ponta (AES-256-GCM)
- Toda comunicação sensível entre o site e a API do bot é empacotada em envelopes criptográficos:
  $$\text{Envelope} = \{ \text{iv}, \text{authTag}, \text{data} \}$$
- Proteção nativa contra adulteração de trânsito, espionagem e falsificação de requisições.

### 🔄 Auto-Descoberta Dinâmica de Comandos (`/help`)
- A central de ajuda se auto-atualiza dinamicamente conforme novos comandos são registrados no gateway do Discord, garantindo documentação visual sempre sincronizada.

---

## 🏗️ Stack Tecnológica & Arquitetura

```
Vanta Bot/
├── src/
│   ├── index.ts               # Ponto de entrada e bootstrap do Constatic
│   ├── env.ts                 # Validação estrita de variáveis de ambiente com Zod
│   ├── constants.ts           # Design tokens e paleta de cores oficial (Vanta aesthetic)
│   ├── database/              # Persistência Google Cloud Firestore via Typesaurus
│   │   ├── index.ts           # Inicialização segura com Firebase Admin SDK
│   │   ├── documents/         # Schemas tipados (GuildDocument, UserDocument, MemberDocument)
│   │   └── functions/         # Operações de negócio (users, verification, guilds, members)
│   ├── discord/               # Módulos Discord auto-carregados pelo Constatic
│   │   ├── commands/          # Comandos Slash (/help, /ping, /counter) em Components V2
│   │   ├── responders/        # Ouvintes de botões com roteamento radix rou3
│   │   └── events/            # Rich presence temática rotativa e loggers
│   ├── functions/             # Utilitários globais
│   │   ├── crypto.ts          # Motor de criptografia AES-256-GCM e envelopes seguros
│   │   └── verification.ts    # Gerador de painéis V2 e tokens temporários
│   └── server/                # Servidor Fastify integrado
│       ├── index.ts           # Inicialização no evento clientReady
│       └── routes/            # Rotas modulares (home, verification, users, dashboard)
├── constants.json             # Definição imutável de paletas de cores
├── PROJECT_STATE.md           # Memória de estado contínua e ledger do projeto
└── tsconfig.json              # Configuração TypeScript estrita com subpath imports (#)
```

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | `@constatic/base` + `@magicyan/discord` | Estrutura modular, radix router e Discord Components V2 |
| **Engine de Execução** | Node.js 22+ / TypeScript 5.7+ | ESM nativo, aliases de importação subpath (`#database`, `#functions`, etc.) |
| **Banco de Dados** | Google Cloud Firestore + `typesaurus` | Persistência NoSQL cloud com tipagem forte ponta a ponta |
| **Servidor Web API** | Fastify 5+ | Comunicação bidirecional e de alta vazão com o Dashboard web |
| **Criptografia** | AES-256-GCM (`node:crypto`) | Envelopes cifrados com integridade autenticada (AEAD) |
| **Validação** | Zod 3 | Validação fail-fast de contratos de dados e `.env` |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** 22.0.0 ou superior instalado.
- Chave de Serviço do Firebase (`serviceAccount.json` ou `firebase.json`) com Firestore ativado.
- Aplicação e Bot criados no [Discord Developer Portal](https://discord.com/developers/applications).

### 1. Clonar o Repositório
```bash
git clone https://github.com/vitordevmm/vantinha.git
cd vantinha
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie o arquivo `.env` baseado no modelo [.env.example](file:///.env.example):
```env
# Discord Credentials
BOT_TOKEN="SEU_DISCORD_BOT_TOKEN"
BOT_ID="1567751920645308548"

# Firestore Database (Caminho do arquivo da Service Account)
FIREBASE_PATH="./serviceAccount.json"

# API Server Config (Fastify)
SERVER_PORT=8080

# Dashboard & API Security (Chaves Mestra)
DASHBOARD_URL="http://localhost:3000"
API_SECRET_KEY="sua_chave_secreta_api"
API_ENCRYPTION_KEY="sua_chave_criptografica_aes256"

NODE_ENV="development"
```

> ⚠️ **Atenção:** O arquivo `.env`, `firebase.json` e `serviceAccount.json` estão protegidos no `.gitignore` e **nunca** devem ser comitados.

### 4. Verificar Tipagem & Sintaxe
```bash
npm run check
```

### 5. Iniciar em Modo de Desenvolvimento (Watch Mode Nativo)
```bash
npm run dev
```
O Vantinha iniciará com hot-reload nativo, monitorando alterações em `./src`, autenticando no Firestore e subindo o servidor Fastify na porta configurada.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o bot em modo de desenvolvimento com hot-reload nativo (`node --watch`) |
| `npm run check` | Executa o compilador TypeScript (`tsc --noEmit`) para validar 100% dos tipos |
| `npm run build` | Compila o projeto TypeScript para JavaScript puro na pasta `/build` |
| `npm start` | Executa o bot em ambiente de produção utilizando o código compilado |

---

## 🔒 Governança & Ledger do Projeto

O desenvolvimento deste bot segue o protocolo rigoroso do [PROJECT_STATE.md](file:///PROJECT_STATE.md). Qualquer ciclo de desenvolvimento exige:
1. Leitura prévia das convenções no ledger.
2. Checagem prévia `npm run check` com 0 erros antes do startup.
3. Auditoria ativa do terminal nos primeiros 10 segundos pós-inicialização.
4. Registro de atualização enumerada (`[Update #XXX]`) com descrição detalhada dos arquivos modificados.
5. Cumprimento estrito da **Lei Suprema de UI: 100% Discord Components V2** e da **Lei de Sigilo de Backend** (zero vazamento de portas e dados internos aos usuários finais).

---

<div align="center">
  <sub>Construído com excelência para o ecossistema <b>Vanta</b>.</sub>
</div>
