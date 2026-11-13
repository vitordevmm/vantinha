# 🌌 Vantinha (Bot do Vanta) — Project State & Ledger

> **Versão Vigente**: `Alpha 1.1.0`  
> **Status**: Ativo & Operacional (Sistema de Verificação com API Fastify & Components V2)  
> **ID da Aplicação Discord**: `1567751920645308548`  
> **Última Atualização**: 2026-11-13 (Build 005)  
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
- **Banco de Dados**: Google Cloud Firestore (via `typesaurus` + `firebase-admin`). Chave do Service Account em `firebase.json` (variável `FIREBASE_PATH`).
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
    │   ├── index.ts         # Inicialização segura do Firebase Admin e schema
    │   ├── documents/       # Tipagens dos documentos
    │   │   ├── GuildDocument.ts   # Documento da guilda com schema de verificação e logs
    │   │   └── MemberDocument.ts  # Documento do membro (xp, moedas, etc.)
    │   └── functions/       # Funções utilitárias de CRUD (guilds, members, verification)
    │       ├── guilds.ts    # getGuildData, upsetGuildData, updateGuildData
    │       ├── members.ts   # getMemberData, upsetMemberData, updateMemberData
    │       └── verification.ts # getVerificationConfig, saveVerificationConfig, findAltsByIp
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
            └── verification.ts # Endpoints completos de verificação, configs e auditoria
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
| `POST` | `/api/verification/verify` | **Sim** | Processa o resultado da verificação (alts, vpn, cargo, logs) |
| `GET` | `/api/guilds/:guildId/verification/logs` | Não | Retorna histórico de auditoria para tabela no site |

---

## 5. Histórico de Atualizações Enumeradas (Changelog)

### [Update #005] — Sistema Completo de Verificação via Dashboard, API Fastify & Proteção Alts/VPN
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Criada a arquitetura completa de **Verificação Controlada por Dashboard**:
     - Suporte a ações configuráveis para contas alternativas/duplicadas (`block`, `kick`, `ban`, `flag`).
     - Suporte a ações configuráveis para IP suspeito / VPN (`block`, `flag`).
     - Seleção de canal do painel, canal de logs de auditoria, cargo entregue e cargo removido.
     - Customização completa visual do painel (título, descrição, cor de destaque hex, label do botão, emoji e rodapé).
  2. Implementado conjunto de endpoints na API Fastify (`src/server/routes/verification.ts` e `home.ts`):
     - `GET /api/guilds`: lista servidores ativos.
     - `GET /api/guilds/:guildId/channels` e `/roles`: alimentam os dropdowns do painel.
     - `GET` & `PUT /api/guilds/:guildId/verification`: leitura e gravação segura das regras.
     - `POST /api/guilds/:guildId/verification/publish`: renderiza e publica o painel no Discord em **100% Discord Components V2**.
     - `GET /api/verification/session/:token`: handshake do usuário na página de verificação.
     - `POST /api/verification/verify`: validação final de IP, alts e VPN, entrega de cargos no Discord e disparo de logs em Components V2.
     - `GET /api/guilds/:guildId/verification/logs`: histórico de auditoria.
  3. Criado responder do botão no Discord em `src/discord/responders/buttons/verify.ts` (`verification/start`), gerando token único de 15 minutos e entregando link efêmero em Components V2.
  4. Validação de sintaxe `npm run check` com 0 erros e auditoria de logs no watch mode.
- **Arquivos Criados / Modificados**:
  - `src/database/documents/GuildDocument.ts` (esquema ampliado)
  - `src/database/functions/verification.ts` (CRUD de verificação e busca de alts por IP)
  - `src/database/index.ts` (re-exportação das funções)
  - `src/functions/verification.ts` (gerador do painel V2 e gerenciador de sessões)
  - `src/functions/index.ts` (exportação de funções)
  - `src/discord/responders/buttons/verify.ts` (responder do botão de verificação)
  - `src/server/routes/verification.ts` (rotas Fastify de verificação)
  - `src/server/routes/home.ts` (endpoint de listar servidores)
  - `src/server/routes/index.ts` (registro das rotas)
  - `src/env.ts`, `.env`, `.env.example` (`DASHBOARD_URL` e `API_SECRET_KEY`)
  - `PROJECT_STATE.md` (versão elevada para `Alpha 1.1.0`)

---

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

1. [ ] **Front-end do Dashboard**: Fornecer o prompt pronto com especificações e contratos da API para o usuário construir a interface no site.
2. [ ] **Chave Real do Firestore**: Inserir arquivo `firebase.json` do Firebase Console para persistência cloud definitiva.
3. [ ] **Módulos Adicionais**: Sistema de Tickets e Sistema de Moderação via Dashboard.
