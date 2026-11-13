# 🌌 Vantinha (Bot do Vanta) — Project State & Ledger

> **Versão Vigente**: `Alpha 1.2.0`  
> **Status**: Ativo & Operacional (Sistema de Verificação, UserDocument & API Fastify)  
> **ID da Aplicação Discord**: `1567751920645308548`  
> **Última Atualização**: 2026-11-13 (Build 006)  
> **Ambiente**: Node.js / Bun / TypeScript (ESM Puro)  

---

> [!CAUTION]
> ### 🛡️ LEI SUPREMA DE UI DO VANTINHA: 100% DISCORD COMPONENTS V2
> **O Vantinha só usa Discord Components V2 — NADA inferior a isso é permitido.**
> - É **terminantemente proibido** utilizar Embeds legadas (`EmbedBuilder` como casca de resposta) ou Action Rows soltas da API v13/v14 antiga.
> - **100% das mensagens, comandos, painéis, modais e respostas interativas** devem ser construídas através de **`createContainer` / `ContainerPlusBuilder`**, estruturadas com `createSection`, `Separator`, `createTextDisplay`, `createThumbnail`, `createMediaGallery`, `createFile` e controles modernos (Checkbox, Radio, FileUpload).
> - **Obrigatório em todas as respostas**: inclusão da flag `flags: ["IsComponentsV2"]` (ou `flags: ["Ephemeral", "IsComponentsV2"]`).

---

> [!IMPORTANT]
> **REGRAS DE OURO PARA QUALQUER IA OU DESENVOLVEDOR**:
> 1. **ANTES de alterar**: leia este arquivo na íntegra para absorver diretrizes, arquitetura e convenções.
> 2. **ANTES de ligar o bot**: execute SEMPRE `npm run check` (`tsc --noEmit`) para conferir se não há erros de sintaxe ou tipagem.
> 3. **NOS PRIMEIROS 10 SEGUNDOS**: inspecione ativamente a saída do terminal para confirmar login, registro de comandos e startup do servidor sem erros.
> 4. **DEPOIS de concluir**: atualize este arquivo incrementando a versão (`[Update #XXX]`), detalhando o que foi feito e listando os arquivos modificados.

---

## 1. Identidade do Projeto & Credenciais

- **Nome**: Vantinha (Bot do Vanta)
- **ID do Bot**: `1567751920645308548`
- **Repositório / Workspace**: `c:\Users\pc\Documents\Vanta Bot`
- **Token do Discord**: Armazenado com segurança exclusivamente no arquivo `.env` (variável `BOT_TOKEN`), validado em `src/env.ts`.
- **Banco de Dados**: Google Cloud Firestore (via `typesaurus` + `firebase-admin`). Coleções: `guilds`, `guilds/:id/members` e `users`.
- **Servidor Web API**: Fastify rodando na porta `8080` (variável `SERVER_PORT`) para comunicação bidirecional com o futuro site/dashboard do Vanta.
- **Segurança da API**: Chave secreta `API_SECRET_KEY` configurada no `.env` (validação via header `x-api-key`).
- **Framework Base**: `constatic` (`@constatic/base` + `@magicyan/discord`).

---

## 2. Paleta de Cores Oficial (`constants.json`)

Toda interface visual do Vantinha (containers e seções) deve seguir estritamente os tokens de cor declarados em `constants.json`:

| Nome do Token | Hexadecimal | Uso Principal |
| :--- | :--- | :--- |
| `constants.colors.vanta` | `#0a0a0c` | Fundo ultra-escuro (Vantablack aesthetic) |
| `constants.colors.vantaDark` | `#121217` | Fundo de cartões secundários e containers |
| `constants.colors.vantaLight` | `#1c1c24` | Bordas e superfícies destacadas |
| `constants.colors.vantaAccent` | `#7c3aed` | Roxo elétrico oficial de destaque e identidade |
| `constants.colors.vantaCyan` | `#06b6d4` | Ciano neon para métricas, status e rotas da API |
| `constants.colors.primary` | `#3b82f6` | Azul de ação primária |
| `constants.colors.secondary` | `#4f545c` | Cinza neutro de ação secundária |
| `constants.colors.success` | `#22c55e` | Verde de sucesso, confirmação e online |
| `constants.colors.danger` | `#ED4245` | Vermelho de alerta, perigo e cancelamento |
| `constants.colors.warning` | `#fbbd23` | Amarelo de atenção e validação |
| `constants.colors.default` | `#2B2D31` | Cinza escuro padrão Discord |

---

## 3. Arquitetura de Diretórios e Arquivos

```
Vanta Bot/
├── .env                     # Variáveis de ambiente sensíveis (Token, Port, API Key)
├── .env.example             # Modelo documentado de variáveis
├── .gitignore               # Regras de exclusão do git (.env, node_modules, build, etc.)
├── constants.json           # Definição imutável de cores e metadados do bot
├── firebase.example.json    # Exemplo do JSON de Service Account do Firestore
├── firebase.json            # Chave de credenciais do Firebase (ignorado no git)
├── firestore.md             # Guia rápido de configuração do Firestore
├── package.json             # Scripts (dev em watch-path=./src), dependências
├── tsconfig.json            # Configuração TypeScript estrita com aliases #
├── PROJECT_STATE.md         # ESTE ARQUIVO: Memória e ledger contínuo do projeto
└── src/
    ├── constants.ts         # Injeta constants.json em globalThis.constants (tipado)
    ├── env.ts               # Validação Zod com DASHBOARD_URL e API_SECRET_KEY
    ├── index.ts             # Ponto de entrada que executa o bootstrap do Constatic
    ├── database/            # Camada de persistência Firestore via Typesaurus
    │   ├── index.ts         # Inicialização segura do Firebase Admin e coleções (guilds, users)
    │   ├── documents/       # Tipagens dos documentos
    │   │   ├── GuildDocument.ts   # Documento da guilda com schema de verificação e logs
    │   │   ├── MemberDocument.ts  # Documento do membro (xp, moedas, etc.)
    │   │   └── UserDocument.ts    # Documento global do usuário (IPs, idade da conta, alts, auditoria)
    │   └── functions/       # Funções utilitárias de CRUD (guilds, members, verification, users)
    │       ├── guilds.ts    # getGuildData, upsetGuildData, updateGuildData
    │       ├── members.ts   # getMemberData, upsetMemberData, updateMemberData
    │       ├── verification.ts # getVerificationConfig, saveVerificationConfig, findAltsByIp
    │       └── users.ts     # getUserData, upsetUserData, recordUserVerification
    ├── discord/             # Módulos Discord auto-carregados pelo Constatic
    │   ├── index.ts         # setupCreators() exportando createCommand, createResponder, createEvent
    │   ├── commands/        # Comandos Slash e Context Menus (100% Components V2)
    │   │   └── public/
    │   │       ├── counter.ts # Exemplo interativo com Discord Components V2
    │   │       ├── help.ts    # Central de ajuda e comandos (100% Components V2)
    │   │       └── ping.ts    # Latência WebSocket e gateway com container V2
    │   ├── responders/      # Ouvintes de botões, selects e modais com radix router
    │   │   └── buttons/
    │   │       ├── remind.ts  # Responder do botão de ping
    │   │       └── verify.ts  # Responder do botão 'verification/start' (link efêmero)
    │   └── events/          # Ouvintes de eventos do Discord.js
    │       ├── presence.ts  # Rotação dinâmica de status e Rich Presence temática
    │       ├── ready.ts     # Log personalizado de inicialização do Vantinha
    │       └── sample.ts    # Template para novos eventos
    ├── functions/           # Funções utilitárias e lógica de negócio
    │   ├── index.ts
    │   └── verification.ts  # buildVerificationPanel (V2), sessões e tokens temporários
    └── server/              # Servidor API Fastify para comunicação com o site
        ├── index.ts         # Inicialização do Fastify via evento clientReady
        └── routes/          # Rotas HTTP estruturadas
            ├── index.ts     # Registro centralizador de rotas
            ├── home.ts      # Rota GET / e GET /api/guilds (seletor de servidores)
            └── verification.ts # Endpoints completos de verificação, logs e perfil do usuário (/api/users/:userId)
```

---

## 4. Endpoints da API Fastify (Comunicação com o Site)

Porta padrão: `8080`. Autenticação via header: `x-api-key: <API_SECRET_KEY>`.

| Método | Endpoint | Protegido | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Não | Status geral do bot e métricas |
| `GET` | `/api/guilds` | Não | Lista os servidores em que o bot está para o dashboard |
| `GET` | `/api/guilds/:guildId/channels` | Não | Lista canais de texto para preencher dropdowns |
| `GET` | `/api/guilds/:guildId/roles` | Não | Lista cargos do servidor para preencher dropdowns |
| `GET` | `/api/guilds/:guildId/verification` | Não | Retorna configurações atuais de verificação |
| `PUT` | `/api/guilds/:guildId/verification` | **Sim** | Salva/atualiza configurações (canais, cargos, alts, vpn, UI) |
| `POST` | `/api/guilds/:guildId/verification/publish` | **Sim** | Envia ou atualiza o painel Components V2 no canal Discord |
| `GET` | `/api/verification/session/:token` | Não | Valida o token temporário quando o usuário abre o site |
| `POST` | `/api/verification/verify` | **Sim** | Processa a verificação, salva no `UserDocument`, entrega cargos e gera logs |
| `GET` | `/api/guilds/:guildId/verification/logs` | Não | Retorna histórico de auditoria para tabela no site |
| `GET` | `/api/users/:userId` | Não | Retorna documento completo do usuário (`UserDocument`) |

---

## 5. Histórico de Atualizações Enumeradas (Changelog)

### [Update #006] — Arquitetura de UserDocument & Persistência de Dados Base do Usuário
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Criado `src/database/documents/UserDocument.ts`:
     - Armazena o dossiê completo de cada usuário: `userId`, `username`, `displayName`, `globalName`, `avatar`, `accountCreatedAt` (ISO), `accountAgeDays` (idade da conta calculada em dias), `firstSeenAt`, `lastSeenAt`, `lastIp`, `knownIps` (histórico de IPs únicos), `knownUserAgents`, `isVpnUser`, `altAccounts`, `status` (`active`, `flagged`, `banned`), `verifications` (mapeadas por servidor) e `fingerprint`.
  2. Implementado `src/database/functions/users.ts`:
     - `getUserData`: Consulta o perfil do usuário no Firestore.
     - `upsetUserData`: Criação e enriquecimento contínuo com merge sem sobrescrever dados prévios.
     - `recordUserVerification`: Chamado automaticamente após a submissão de verificação, calculando a idade da conta, guardando novo IP na lista de conhecidos e registrando o histórico de verificação.
  3. Atualizado o schema central em `src/database/index.ts` adicionando a coleção raiz `users`.
  4. Integrado na rota `POST /api/verification/verify` para salvar instantaneamente o `UserDocument` a cada tentativa/sucesso de verificação.
  5. Adicionado novo endpoint `GET /api/users/:userId` para o dashboard inspecionar o dossiê de qualquer membro.
  6. Checagem de tipos estrita `npm run check` com 0 erros.
- **Arquivos Criados / Modificados**:
  - `src/database/documents/UserDocument.ts` (criado)
  - `src/database/functions/users.ts` (criado)
  - `src/database/index.ts` (esquema `users` adicionado)
  - `src/server/routes/verification.ts` (integração de salvamento e endpoint `GET /api/users/:userId`)
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.2.0`)

---

### [Update #005] — Sistema Completo de Verificação via Dashboard, API Fastify & Proteção Alts/VPN
- Criação dos endpoints da API, regras de alts/vpn e painel em Components V2.

### [Update #004] — Sistema de Presença Temática Rotativa & Comando /help em Components V2
- Rotação dinâmica de Rich Presence a cada 20 segundos e comando `/help` em Components V2.

### [Update #003] — Hot-Reload Nativo (Watch Mode), Checagem Pré-Startup & Auditoria de 10s
- Watch mode automático e protocolos de checagem.

### [Update #002] — Promulgação da Lei Suprema de UI: 100% Discord Components V2 Exclusivo
- Banimento de embeds legadas e obrigatoriedade de Components V2.

### [Update #001] — Fundação, Bootstrap Constatic, Components V2, Firestore & Fastify API
- Inicialização do bot, tokens, Firestore e Fastify.

---

## 6. Próximos Passos & Roadmap

1. [ ] **Front-end do Dashboard**: Instruir e criar as interfaces no site para consumir os endpoints.
2. [ ] **Chave Real do Firestore**: Inserir arquivo `firebase.json` do Firebase Console para persistência cloud definitiva.
3. [ ] **Módulo de Moderação e Auditoria**: Novos endpoints e comandos.
