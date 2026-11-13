# 🌌 Vantinha (Bot do Vanta) — Project State & Ledger

> **Versão Vigente**: `Alpha 1.0.0`  
> **Status**: Ativo & Operacional (Base Constatic + Discord Components V2 + Firestore + Fastify API)  
> **ID da Aplicação Discord**: `1567751920645308548`  
> **Última Atualização**: 2026-11-13 (Build 001)  
> **Ambiente**: Node.js / Bun / TypeScript (ESM Puro)  

---

> [!IMPORTANT]
> **REGRA DE OURO PARA QUALQUER IA OU DESENVOLVEDOR**:
> 1. **ANTES** de executar qualquer alteração, leia este arquivo na íntegra para absorver diretrizes, arquitetura e convenções.
> 2. **DEPOIS** de qualquer alteração, atualize este arquivo: incremente o número da atualização (`[Update #XXX]`), descreva as novidades, liste os arquivos modificados e detalhe o que foi alterado em cada um.

---

## 1. Identidade do Projeto & Credenciais

- **Nome**: Vantinha (Bot do Vanta)
- **ID do Bot**: `1567751920645308548`
- **Repositório / Workspace**: `c:\Users\pc\Documents\Vanta Bot`
- **Token do Discord**: Armazenado com segurança exclusivamente no arquivo `.env` (variável `BOT_TOKEN`), validado em `src/env.ts`.
- **Banco de Dados**: Google Cloud Firestore (via `typesaurus` + `firebase-admin`). Chave do Service Account em `firebase.json` (variável `FIREBASE_PATH`).
- **Servidor Web API**: Fastify rodando na porta `8080` (variável `SERVER_PORT`) para comunicação bidirecional com o futuro site/dashboard do Vanta.
- **Framework Base**: `constatic` (`@constatic/base` + `@magicyan/discord`).

---

## 2. Paleta de Cores Oficial (`constants.json`)

Toda interface visual do Vantinha (seja em Containers V2 ou Embeds) deve seguir estritamente os tokens de cor declarados em `constants.json`:

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
├── .env                     # Variáveis de ambiente sensíveis (Token, Port, Paths)
├── .env.example             # Modelo documentado de variáveis
├── .gitignore               # Regras de exclusão do git (.env, node_modules, build, etc.)
├── constants.json           # Definição imutável de cores e metadados do bot
├── firebase.example.json    # Exemplo do JSON de Service Account do Firestore
├── firebase.json            # Chave de credenciais do Firebase (ignorado no git)
├── firestore.md             # Guia rápido de configuração do Firestore
├── package.json             # Dependências (ESM, scripts, subpath imports)
├── tsconfig.json            # Configuração TypeScript estrita com aliases #
├── PROJECT_STATE.md         # ESTE ARQUIVO: Memória e ledger contínuo do projeto
└── src/
    ├── constants.ts         # Injeta constants.json em globalThis.constants (tipado)
    ├── env.ts               # Validação de variáveis de ambiente com Zod
    ├── index.ts             # Ponto de entrada que executa o bootstrap do Constatic
    ├── database/            # Camada de persistência Firestore via Typesaurus
    │   ├── index.ts         # Inicialização segura do Firebase Admin e schema
    │   ├── documents/       # Tipagens dos documentos
    │   │   ├── GuildDocument.ts   # Documento da guilda (canais, logs, etc.)
    │   │   └── MemberDocument.ts  # Documento do membro (xp, moedas, etc.)
    │   └── functions/       # Funções utilitárias de CRUD (guilds e members)
    │       ├── guilds.ts    # getGuildData, upsetGuildData, updateGuildData
    │       └── members.ts   # getMemberData, upsetMemberData, updateMemberData
    ├── discord/             # Módulos Discord auto-carregados pelo Constatic
    │   ├── index.ts         # setupCreators() exportando createCommand, createResponder, createEvent
    │   ├── commands/        # Comandos Slash e Context Menus
    │   │   └── public/
    │   │       ├── counter.ts # Exemplo interativo com Discord Components V2
    │   │       └── ping.ts    # Latência WebSocket e gateway com card V2
    │   ├── responders/      # Ouvintes de botões, selects e modais com radix router
    │   │   └── buttons/
    │   │       └── remind.ts  # Responder do botão de ping com validação de params
    │   └── events/          # Ouvintes de eventos do Discord.js
    │       ├── ready.ts     # Log personalizado de inicialização do Vantinha
    │       └── sample.ts    # Template para novos eventos
    ├── functions/           # Funções utilitárias e lógica de negócio
    │   └── index.ts
    └── server/              # Servidor API Fastify para comunicação com o site
        ├── index.ts         # Inicialização do Fastify via evento clientReady
        └── routes/          # Rotas HTTP estruturadas
            ├── index.ts     # Registro centralizador de rotas
            └── home.ts      # Rota GET / com status, uptime e métricas do bot
```

---

## 4. Boas Práticas & Diretrizes de Desenvolvimento

### ✅ O QUE FAZER:
1. **Subpath Imports Obrigatórios**: Utilize sempre `#env`, `#base`, `#database`, `#server`, `#functions` em vez de caminhos relativos profundos.
2. **Discord Components V2**: Use sempre `createContainer`, `createSection`, `createTextDisplay` e `Separator` com a flag `flags: ["IsComponentsV2"]` (ou `["Ephemeral", "IsComponentsV2"]`).
3. **Verbatim Module Syntax**: Escreva `import type { ... }` para tipos e `export type { ... }` para re-exportar interfaces para manter compatibilidade com o TypeScript configurado.
4. **Radix Routing com `createResponder`**: Use `customId: "acao/:param1/:param2"` e use o callback `parse` para deserializar e validar os parâmetros.
5. **Fail-Fast no .env**: Qualquer nova variável de ambiente obrigatória deve ser tipada no schema do Zod em `src/env.ts`.
6. **Checagem de Tipos Estrita**: Antes de concluir qualquer tarefa, rode `npm run check` (`tsc --noEmit`) para validar 100% de conformidade de tipos.

### ❌ O QUE NÃO FAZER:
1. **NÃO altere o código sem atualizar este arquivo (`PROJECT_STATE.md`)**.
2. **NÃO comite nem exponha tokens ou chaves privadas**.
3. **NÃO utilize caminhos relativos como `../../../../`**.
4. **NÃO crie ouvintes de interação manuais** fora do padrão `createResponder`.
5. **NÃO faça split manual de strings em customId** (`customId.split("_")`).
6. **NÃO passe apenas uma string para `createSection` sem acessório**: Se não houver acessório (botão ou thumbnail), use `createTextDisplay("...")` ou `createSection({ content: "..." })`.

---

## 5. Histórico de Atualizações Enumeradas (Changelog)

### [Update #001] — Fundação, Bootstrap Constatic, Components V2, Firestore & Fastify API
- **Data**: 2026-11-13
- **Autor / Agente**: Antigravity & Usuário
- **Resumo da Entrega**:
  1. Leitura minuciosa de toda a base do Constatic (`constatic@1.5.9`), `@constatic/base` e `@magicyan/discord`.
  2. Inicialização completa da estrutura do projeto Vantinha no workspace `c:\Users\pc\Documents\Vanta Bot`.
  3. Configuração do `.env` com ID oficial do bot (`1567751920645308548`), Token de acesso fornecido, porta do servidor Fastify (`8080`) e caminho do Firestore (`./firebase.json`).
  4. Configuração das cores temáticas do Vanta em `constants.json`.
  5. Integração do banco de dados Google Cloud Firestore via `typesaurus` e `firebase-admin` com proteção para credenciais placeholder.
  6. Integração do servidor Fastify em `src/server` inicializado automaticamente no evento `clientReady` com rota GET `/` detalhada.
  7. Implementação de comandos e responders demonstrando Discord Components V2 (`/counter`, `/ping`, e responder `remind/:date`) estilizados na paleta Vanta.
  8. Resolução estrita de conformidade TypeScript (`verbatimModuleSyntax`, Zod 3 schemas, typesaurus schemas, `@magicyan/discord` builders). `npm run check` passando com 0 erros.
  9. Criação da suíte de 3 skills especializadas em `C:\Users\pc\.gemini\config\skills/`:
     - `constatic-framework`: Boas práticas completas do Constatic.
     - `discord-components-v2`: Guia aprofundado dos componentes modernos do Discord.
     - `vantinha-project-ledger`: Protocolo de memória e rastreamento contínuo deste projeto.

- **Arquivos Criados / Modificados**:
  - `package.json`: Definido nome `vantinha-bot`, dependências `@constatic/base`, `@magicyan/discord`, `fastify`, `@fastify/cors`, `firebase-admin`, `typesaurus`, `zod`.
  - `tsconfig.json`: Aliases `#env`, `#base`, `#database`, `#server`, `#functions`, `#menus`, `#tools`, `#lib/*`, `#shared/*`.
  - `.env`: Credenciais configuradas (BOT_TOKEN, BOT_ID, FIREBASE_PATH, SERVER_PORT).
  - `.env.example`: Template limpo para onboarding.
  - `constants.json`: Adicionada seção de metadados do bot e paleta Vanta (`vanta`, `vantaDark`, `vantaAccent`, `vantaCyan`).
  - `src/env.ts`: Validação Zod tipada e estrita com fail-fast.
  - `src/index.ts`: Importação de `#server` e execução de `bootstrap()`.
  - `src/database/index.ts`: Inicialização segura do Firebase Admin com tratamento para placeholder e schema Typesaurus.
  - `src/database/documents/GuildDocument.ts` & `MemberDocument.ts`: Exportação com `export type` para conformidade `verbatimModuleSyntax`.
  - `src/database/functions/guilds.ts` & `members.ts`: Imports de tipo ajustados.
  - `src/server/index.ts`: Inicialização do Fastify na porta configurada.
  - `src/server/routes/home.ts`: Rota HTTP informando dados do Vantinha e estatísticas.
  - `src/discord/commands/public/counter.ts`: Contador com Discord Components V2 e cor `vantaAccent`.
  - `src/discord/commands/public/ping.ts`: Ping com latência, botão interativo e container V2.
  - `src/discord/responders/buttons/remind.ts`: Responder com parâmetros de rota dinâmicos e container V2.
  - `src/discord/events/ready.ts`: Evento `clientReady` com logger formatado e estilizado.
  - `C:\Users\pc\.gemini\config\skills\constatic-framework\SKILL.md`: Criada skill de boas práticas do Constatic.
  - `C:\Users\pc\.gemini\config\skills\discord-components-v2\SKILL.md`: Criada skill de Discord Components V2.
  - `C:\Users\pc\.gemini\config\skills\vantinha-project-ledger\SKILL.md`: Criada skill de governança contínua.
  - `PROJECT_STATE.md`: Criado este ledger central.

---

## 6. Próximos Passos & Roadmap

1. [ ] **Chave Real do Firestore**: Quando o operador tiver o arquivo `firebase.json` definitivo do Firebase Console, basta salvá-lo na raiz para ativar a persistência em nuvem.
2. [ ] **Endpoints para o Site**: Desenvolver novas rotas no Fastify (`/api/guilds`, `/api/stats`, `/api/config`) para conectar o site/dashboard ao bot.
3. [ ] **Sistema de Autenticação / OAuth2**: Preparar endpoints para login com Discord caso o site precise identificar os usuários.
4. [ ] **Comandos de Gerenciamento do Vanta**: Criar novos comandos de configuração usando Discord Components V2 (menus, botões, modais).
