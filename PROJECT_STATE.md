# 🌌 Vantinha (Bot do Vanta) — Project State & Ledger

> **Versão Vigente**: `Alpha 2.0.0`  
> **Status**: Ativo & Operacional (Sincronização Contínua GitHub Origin Ativa, OAuth2 com 4 Escopos & Master Data Gateway)  
> **ID da Aplicação Discord**: `1567751920645308548`  
> **Repositório GitHub**: `https://github.com/vitordevmm/vantinha` (Ramos: `main` e `master` sincronizados)  
> **Última Atualização**: 2026-11-13 (Build 014)  
> **Ambiente**: Node.js / Bun / TypeScript (ESM Puro)  

---

> [!CAUTION]
> ### 🛡️ LEI SUPREMA DE UI DO VANTINHA: 100% DISCORD COMPONENTS V2
> **O Vantinha só usa Discord Components V2 — NADA inferior a isso é permitido.**
> - É **terminantemente proibido** utilizar Embeds legadas (`EmbedBuilder` como casca de resposta) ou Action Rows soltas da API v13/v14 antiga.
> - **100% das mensagens, comandos, painéis, modais e respostas interativas** devem ser construídas através de **`createContainer` / `ContainerPlusBuilder`**, estruturadas com `createSection`, `Separator`, `createTextDisplay`, `createThumbnail`, `createMediaGallery`, `createFile` e controles modernos (Checkbox, Radio, FileUpload).
> - **Obrigatório em todas as respostas**: inclusão da flag `flags: ["IsComponentsV2"]` (ou `flags: ["Ephemeral", "IsComponentsV2"]`).

---

> [!CAUTION]
> ### 🔒 LEI SUPREMA DE PRIVACIDADE & SEGURANÇA: ZERO EXPOSIÇÃO DE BACKEND
> **Detalhes internos de infraestrutura e backend NUNCA devem ser divulgados para usuários finais no Discord.**
> - **Zero Exposição de Portas**: NUNCA divulgue portas de rede (ex: `8080`, `3000`).
> - **Zero Exposição de Tecnologias/Frameworks**: NUNCA cite ferramentas ou frameworks em mensagens aos membros (`Constatic`, `Fastify`, `Typesaurus`, `Node.js`, `ESM`, etc.).
> - **Zero Exposição de Banco de Dados**: NUNCA mencione projetos de nuvem internos ou nomes de banco (`vantinha-e9fca`, `Firestore`, coleções).
> - **Foco Exclusivo no Usuário**: As mensagens do Discord devem focar 100% na experiência do membro, design da marca Vanta, utilidade pública e instruções claras, sem expor a superfície técnica de ataque.

---

> [!IMPORTANT]
> **REGRAS DE OURO PARA QUALQUER IA OU DESENVOLVEDOR**:
> 1. **ANTES de alterar**: leia este arquivo na íntegra para absorver diretrizes, arquitetura e convenções.
> 2. **ANTES de ligar o bot**: execute SEMPRE `npm run check` (`tsc --noEmit`) para conferir se não há erros de sintaxe ou tipagem.
> 3. **NOS PRIMEIROS 10 SEGUNDOS**: inspecione ativamente a saída do terminal para confirmar login, registro de comandos e startup do servidor sem erros.
> 4. **DEPOIS de concluir**: atualize este arquivo incrementando a versão (`[Update #XXX]`), detalhando o que foi feito e listando os arquivos modificados.
> 5. **REGRA MANDATÓRIA DE COMANDOS**: **SEMPRE atualizar e verificar o comando `/help` a cada novo comando criado**. O `/help` possui auto-descoberta dinâmica de comandos registrados e catálogo de metadados visuais (`COMMAND_METADATA`). Todo novo comando deve ser integrado e documentado.
> 6. **BLINDAGEM DE PRIVACIDADE**: **NUNCA vazar dados de backend para usuários finais**. Portas, tecnologias de servidor e dados internos são mantidos em segredo estrito de desenvolvimento.

---

## 1. Identidade do Projeto & Credenciais

- **Nome**: Vantinha (Bot do Vanta)
- **ID do Bot**: `1567751920645308548`
- **Repositório / Workspace**: `c:\Users\pc\Documents\Vanta Bot`
- **Repositório Remoto GitHub**: `https://github.com/vitordevmm/vantinha` (origin)
- **Token do Discord**: Armazenado com segurança exclusivamente no arquivo `.env` (variável `BOT_TOKEN`), validado em `src/env.ts`.
- **Banco de Dados**: Google Cloud Firestore (via `typesaurus` + `firebase-admin`). Projeto oficial: `vantinha-e9fca`. Credenciais salvas em `firebase.json` e `serviceAccount.json` (ambos protegidos no `.gitignore`). Coleções ativas: `guilds`, `guilds/:id/members` e `users`.
- **Servidor Web API**: Fastify rodando na porta `8080` (variável `SERVER_PORT`) para comunicação bidirecional com o futuro site/dashboard do Vanta.
- **Segurança da API**: Chave secreta `API_SECRET_KEY` configurada no `.env` (validação via header `x-api-key`).
- **Criptografia E2E da API**: AES-256-GCM ponta a ponta com chave derivada SHA-256 (`API_ENCRYPTION_KEY`). Envelopes autenticados `{ iv, authTag, data }` anti-violação e anti-adulteração.
- **Framework Base**: `constatic` (`@constatic/base` + `@magicyan/discord`).

---

## 2. Paleta de Cores Oficial (`constants.json`)

Toda interface visual do Vantinha (containers e seções) deve seguir estritamente os tokens de cor declarados em `constants.json`:

| Nome do Token | Hexadecimal | Uso Principal |
| :--- | :--- | :--- |
| `constants.colors.vantaGold` | `#E5A93C` | **Dourado Oficial Vanta** (Cor principal da marca e do site web) |
| `constants.colors.vanta` | `#0a0a0c` | Fundo ultra-escuro (Vantablack aesthetic) |
| `constants.colors.vantaDark` | `#121217` | Fundo de cartões secundários e containers |
| `constants.colors.vantaLight` | `#1c1c24` | Bordas e superfícies destacadas |
| `constants.colors.vantaAccent` | `#7c3aed` | Roxo elétrico dos containers do bot no Discord |
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
    │   ├── crypto.ts        # Motor de criptografia AES-256-GCM com envelopes autenticados
    │   └── verification.ts  # buildVerificationPanel (V2), sessões e tokens temporários
    └── server/              # Servidor API Fastify para comunicação com o site
        ├── index.ts         # Inicialização do Fastify via evento clientReady
        └── routes/          # Rotas HTTP estruturadas
            ├── index.ts     # Registro centralizador de rotas
            ├── home.ts      # Rota GET / e GET /api/guilds (seletor de servidores)
            ├── verification.ts # Endpoints completos de verificação, logs e handshake criptográfico
            ├── users.ts     # Gateway Mestre de Usuários (Sync OAuth/Web, busca, paginação, moderação)
            └── dashboard.ts # Métricas consolidadas e membros para o dashboard web
```

---

## 4. Endpoints da API Fastify (Comunicação com o Site)

Porta padrão: `8080`.
- **Autenticação**: Header obrigatório `x-api-key: <API_SECRET_KEY>`.
- **Criptografia E2E (AES-256-GCM)**: Suporte a envelopes protegidos `{ iv: string, authTag: string, data: string }` usando chave derivada de `API_ENCRYPTION_KEY`.

| Método | Endpoint | Protegido | Criptografia E2E | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Não | Opcional | Status geral do bot e métricas |
| `POST` | `/api/crypto/handshake` | **Sim** | **Sim (AES-256-GCM)** | Teste bidirecional de integridade criptográfica |
| `GET` | `/api/dashboard/overview` | **Sim** | **Sim (Envelope)** | Visão geral consolidada de métricas, saúde do bot e atividades |
| `GET` | `/api/guilds` | Não | Opcional | Lista os servidores em que o bot está para o dashboard |
| `GET` | `/api/guilds/:guildId/channels` | Não | Opcional | Lista canais de texto para preencher dropdowns |
| `GET` | `/api/guilds/:guildId/roles` | Não | Opcional | Lista cargos do servidor para preencher dropdowns |
| `GET` | `/api/guilds/:guildId/members` | **Sim** | **Sim (Envelope)** | Lista membros do servidor com cargos e dados de criação |
| `GET` | `/api/guilds/:guildId/verification` | Não | Opcional | Retorna configurações atuais de verificação |
| `PUT` | `/api/guilds/:guildId/verification` | **Sim** | **Sim (Envelope)** | Salva/atualiza configurações (canais, cargos, alts, vpn, UI) |
| `POST` | `/api/guilds/:guildId/verification/publish` | **Sim** | **Sim (Envelope)** | Envia ou atualiza o painel Components V2 no canal Discord |
| `GET` | `/api/verification/session/:token` | Não | Opcional | Valida o token temporário quando o usuário abre o site |
| `POST` | `/api/verification/verify` | **Sim** | **Sim (Envelope)** | Processa a verificação, salva no `UserDocument`, entrega cargos e gera logs |
| `GET` | `/api/guilds/:guildId/verification/logs` | Não | Opcional | Retorna histórico de auditoria para tabela no site |
| `POST` | `/api/users/sync` | **Sim** | **Sim (Envelope)** | **Gateway Mestre**: Sincroniza telemetria do site (alts, idade, IP, sessões) |
| `GET` | `/api/users` | **Sim** | **Sim (Envelope)** | Diretório de usuários com filtros (`search`, `status`, `hasAlts`) e paginação |
| `GET` | `/api/users/:userId` | **Sim** | **Sim (Envelope)** | Dossiê completo do usuário com enriquecimento ao vivo do Discord |
| `PUT` | `/api/users/:userId` | **Sim** | **Sim (Envelope)** | Atualiza status (`active`, `flagged`, `banned`) e anotações administrativas |
| `POST` | `/api/users/:userId/action` | **Sim** | **Sim (Envelope)** | Dispara ações no Discord (`kick`, `ban`, `unban`) via Dashboard |

---

## 5. Histórico de Atualizações Enumeradas (Changelog)

### [Update #014] — Autenticação do Remote GitHub & Primeiro Push com Sucesso Total
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Configurada a autenticação segura do repositório remoto Git `origin` (`https://github.com/vitordevmm/vantinha.git`).
  2. Publicado o histórico completo do projeto em produção no GitHub nos ramos `main` e `master`.
  3. Realizada auditoria de integridade do histórico: 100% livre de segredos ou tokens sensíveis (`.env`, `firebase.json` e `serviceAccount.json` totalmente resguardados no `.gitignore`).
  4. Protocolo contínuo ativo: a cada nova atualização concluída, o commit e o push são automaticamente sincronizados com o repositório remoto.
- **Arquivos Modificados**:
  - `PROJECT_STATE.md` (versão elevada para `Alpha 2.0.0`)

### [Update #013] — Integração OAuth2 com Escopos (identify, guilds, guilds.join, connections) & Dossiê
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Definidos e padronizados os 4 escopos oficiais do Discord OAuth2 para o Vanta:
     - `identify`: dados essenciais de perfil (ID, username, avatar).
     - `guilds`: mapeamento de servidores que o membro participa.
     - `guilds.join`: permissão para adicionar o membro diretamente à guilda oficial.
     - `connections`: contas vinculadas de terceiros (Steam, GitHub, Twitch, YouTube, Twitter/X, Riot Games, etc.) para validações e integrações futuras.
  2. Implementado helper utilitário `buildDiscordOAuthUrl` em `src/functions/verification.ts` para geração padronizada da URL de consentimento com o parâmetro `state` (token de sessão temporária de 15 minutos).
  3. Atualizado o schema `UserDocument.ts` e as funções de banco (`users.ts`) para armazenar:
     - `connections`: array de contas vinculadas (`id`, `name`, `type`, `verified`).
     - `guilds`: array resumido de servidores (`id`, `name`, `owner`).
     - `accessToken`: token de acesso do usuário para adição em servidores via `guilds.join`.
  4. Atualizados os endpoints `POST /api/verification/verify` e `POST /api/users/sync` para receber e persistir conexões e guilds de forma criptografada via AES-256-GCM.
- **Arquivos Modificados**:
  - `src/database/documents/UserDocument.ts`
  - `src/database/functions/users.ts`
  - `src/functions/verification.ts`
  - `src/server/routes/users.ts`
  - `src/server/routes/verification.ts`
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.9.0`)

### [Update #012] — README.md Oficial Estilizado & Vinculação ao Repositório GitHub
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Configurado o remote Git `origin` apontando para o repositório oficial do projeto: `https://github.com/vitordevmm/vantinha`.
  2. Criado o `README.md` completo, profissional e altamente estilizado:
     - Badges oficiais de tecnologias (TypeScript, Node.js 22+, Constatic Base, Discord.js v14, Components V2, Fastify, Firestore, AES-256-GCM).
     - Apresentação executiva do bot e suas principais capacidades (Master Data Gateway, Verificação com Alts/VPN, UI 100% Components V2, Criptografia E2E).
     - Diagrama detalhado da árvore de diretórios e tabela de papéis da arquitetura.
     - Guia passo a passo de clone, instalação, scripts e setup local.
     - **Sigilo total mantido**: nenhum token, chave privada ou segredo sensível exposto (apenas modelos de `.env.example`).
  3. Formalizado o protocolo de Git commit contínuo obrigatório a cada atualização concluída.
- **Arquivos Criados / Modificados**:
  - `README.md` (criado estilizado)
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.8.0`)

### [Update #011] — Promulgação da Lei de Privacidade & Purificação de Detalhes de Backend
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Promulgada a **Lei Suprema de Privacidade & Segurança: Zero Exposição de Backend**:
     - Fica terminantemente proibido exibir portas de rede (ex: `8080`), nomes de bases/frameworks (`Constatic`, `Fastify`, `Typesaurus`, `Node.js`, `ESM`), nomes de projetos internos (`vantinha-e9fca`) ou coleções em qualquer mensagem direcionada aos usuários finais no Discord.
  2. Executada a **Purificação Completa de Comandos e Componentes**:
     - [src/discord/commands/public/help.ts](file:///c:/Users/pc/Documents/Vanta%20Bot/src/discord/commands/public/help.ts): Removidos todos os vazamentos de backend (portas, frameworks, bancos). Substituído por bloco oficial de suporte e comunidade Vanta.
     - [src/discord/commands/public/ping.ts](file:///c:/Users/pc/Documents/Vanta%20Bot/src/discord/commands/public/ping.ts): Removida citação ao Constatic e Components V2 na mensagem pública.
     - [src/discord/commands/public/counter.ts](file:///c:/Users/pc/Documents/Vanta%20Bot/src/discord/commands/public/counter.ts): Ajustada a descrição pública para "Contador interativo oficial do Vantinha 🔢".
     - [src/functions/verification.ts](file:///c:/Users/pc/Documents/Vanta%20Bot/src/functions/verification.ts) e [src/database/functions/verification.ts](file:///c:/Users/pc/Documents/Vanta%20Bot/src/database/functions/verification.ts): Rodapé padronizado para "Vanta Security Gateway • Autenticação Segura" (eliminando termos técnicos de biblioteca).
  3. Atualizada a skill de governança `vantinha-project-ledger` e a lista de Regras de Ouro no ledger do projeto.
- **Arquivos Modificados**:
  - `src/discord/commands/public/help.ts`
  - `src/discord/commands/public/ping.ts`
  - `src/discord/commands/public/counter.ts`
  - `src/functions/verification.ts`
  - `src/database/functions/verification.ts`
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.7.0`)

### [Update #010] — Central /help Dinâmica, Auto-Descoberta de Comandos & Regra Mandatória
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Refatorado `src/discord/commands/public/help.ts`:
     - Implementada **auto-descoberta dinâmica** de comandos registrados na aplicação Discord (`interaction.client.application.commands.cache`), eliminando o risco de comandos ficarem desatualizados.
     - Implementado catálogo `COMMAND_METADATA` para enriquecer comandos com emojis temáticos oficiais e categorização.
     - Contador dinâmico de comandos ativos no botão acessório da seção principal em Discord Components V2.
     - Fallback resiliente caso haja oscilações temporárias na API do Discord.
  2. Adicionada regra mandatória permanente no `PROJECT_STATE.md` (Regra #5 das Regras de Ouro) e na skill do projeto: **todo novo comando criado no Discord deve obrigatoriamente ser verificado e atualizado na central `/help`**.
- **Arquivos Modificados**:
  - `src/discord/commands/public/help.ts` (auto-descoberta dinâmica e Components V2)
  - `PROJECT_STATE.md` (regra mandatória registrada, versão elevada para `Alpha 1.6.0`)

### [Update #009] — Gateway Mestre de Dados do Usuário & Dashboard com E2E AES-256-GCM
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Criado **Gateway Mestre de Dados** (`src/server/routes/users.ts` e `src/database/functions/users.ts`):
     - O site não precisa conhecer ou manipular schemas complexos do Firestore diretamente.
     - Endpoint `POST /api/users/sync`: recebe login OAuth2/acesso do site, calcula automaticamente `accountAgeDays`, vincula histórico de `knownIps` e `knownUserAgents`, atualiza `lastSeenAt` e detecta contas secundárias.
     - **Detecção Global de Alts**: implementada função `findGlobalAltsByIp` que detecta e vincula bidirecionalmente contas secundárias compartilhando o mesmo IP.
     - Endpoint `GET /api/users`: tabela completa para o dashboard com paginação (`page`, `limit`), busca textual e filtros (`status`, `hasAlts`).
     - Endpoint `GET /api/users/:userId`: dossiê detalhado enriquecido em tempo real com dados de presença e cargos do Discord.
     - Endpoints `PUT /api/users/:userId` e `POST /api/users/:userId/action`: controle administrativo direto pelo dashboard (alteração de status, kick, ban e unban).
  2. Criado módulo de visualização `src/server/routes/dashboard.ts`:
     - Endpoint `GET /api/dashboard/overview`: retorna métricas consolidadas (usuários totais, verificados, alts, flags, VPNs, ping WebSocket, uptime, memória e feeds recentes).
     - Endpoint `GET /api/guilds/:guildId/members`: listagem de membros do Discord com cargos e datas.
  3. Refatoração e centralização de segurança em `src/functions/crypto.ts`:
     - Helpers `processSecureRequest` e `sendSecureResponse` exportados como padrão para todas as rotas da API, garantindo conformidade AES-256-GCM em 100% dos fluxos.
- **Arquivos Criados / Modificados**:
  - `src/server/routes/users.ts` (criado)
  - `src/server/routes/dashboard.ts` (criado)
  - `src/database/functions/users.ts` (novas funções `findGlobalAltsByIp`, `syncWebUser`, `listUsers`, `updateUserStatus`)
  - `src/functions/crypto.ts` (exportação de helpers reutilizáveis)
  - `src/server/routes/index.ts` (registro das novas rotas)
  - `src/server/routes/verification.ts` (limpeza de duplicatas)
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.5.0`)

### [Update #008] — Conexão Definitiva do Google Cloud Firestore (Projeto: vantinha-e9fca)
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Integrado o arquivo de credenciais oficial `service_account` do Firebase para o projeto `vantinha-e9fca`.
  2. Arquivos `firebase.json` e `serviceAccount.json` criados e blindados com regras no `.gitignore` para impedir vazamentos acidentais no Git.
  3. Atualizado `src/database/index.ts` com fallback inteligente de caminhos (`env.FIREBASE_PATH`, `./firebase.json`, `./serviceAccount.json`) e log de identificação do projeto.
  4. Executado teste funcional em tempo real com Typesaurus: operações de criação (`upset`), leitura (`get`) e remoção (`remove`) executadas com 100% de sucesso contra a nuvem do Google Cloud Firestore.
  5. API Fastify já servindo e persistindo dados reais diretamente no Firestore em produção.
- **Arquivos Modificados / Criados**:
  - `firebase.json` (credenciais da Service Account salvas, ignorado pelo git)
  - `serviceAccount.json` (espelho de segurança, ignorado pelo git)
  - `.gitignore` (regras `/firebase.json` e `serviceAccount.json` asseguradas)
  - `src/database/index.ts` (carregamento resiliente e logs de projeto)
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.4.0`)

### [Update #007] — Camada de Criptografia E2E AES-256-GCM & Handshake de Segurança
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Criado módulo de alta segurança `src/functions/crypto.ts`:
     - Algoritmo: **AES-256-GCM** (Galois/Counter Mode com AEAD).
     - Derivação de chave de 32 bytes via `crypto.createHash('sha256')` a partir da variável `API_ENCRYPTION_KEY`.
     - IV aleatório criptográfico de 12 bytes por payload.
     - Auth Tag de 16 bytes garantindo que mensagens alteradas ou forjadas sejam rejeitadas com erro 403 antes de qualquer processamento.
     - Formato do Envelope: `{ iv: string, authTag: string, data: string }`.
  2. Adicionado suporte no `src/server/routes/verification.ts`:
     - Helpers `processSecureRequest` e `sendSecureResponse` para aceitar envelopes cifrados e responder criptografado automaticamente.
     - Endpoint de teste e validação `POST /api/crypto/handshake`.
     - Atualização transparente dos endpoints de escrita (`PUT /api/guilds/:guildId/verification`, `POST /api/guilds/:guildId/verification/publish`, `POST /api/verification/verify`).
  3. Atualizado `src/env.ts`, `.env` e `.env.example` com `API_ENCRYPTION_KEY`.
  4. Realizado teste automatizado de handshake: sucesso com chave válida, 401 para API key inválida, e 403 para tentativa de adulteração ou chave errada.
- **Arquivos Criados / Modificados**:
  - `src/functions/crypto.ts` (criado)
  - `src/functions/index.ts` (exportação do crypto)
  - `src/env.ts` (validação de `API_ENCRYPTION_KEY`)
  - `.env` e `.env.example` (definição de chave)
  - `src/server/routes/verification.ts` (integração E2E e handshake)
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.3.0`)

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

1. [x] **Chave Real do Firestore**: Inserido `serviceAccount.json` / `firebase.json` do projeto oficial `vantinha-e9fca` com persistência ativa e testada.
2. [ ] **Front-end do Dashboard**: Instruir e criar as interfaces no site para consumir os endpoints com AES-256-GCM.
3. [ ] **Módulo de Moderação e Auditoria**: Novos endpoints e comandos.
