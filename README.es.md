<div align="center">

# 🌌 Vantinha — Bot Oficial del Ecosistema Vanta

<p align="center">
  <b>Asistente inteligente de alto rendimiento, gateway de seguridad, verificación y automatización oficial de Vanta.</b>
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
[![Security](https://img.shields.io/badge/Security-AES--256--GCM%20E2E-06b6d4?style=for-the-badge&logo=shield&logoColor=white)](#-capa-de-seguridad-y-cifrado-e2e)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Anti--Plagiarism-red?style=for-the-badge&logo=lock&logoColor=white)](LICENSE)

---

</div>

## 📖 Visión General

**Vantinha** es la columna vertebral del ecosistema Discord de **Vanta**. Construido sobre una arquitectura moderna en **TypeScript ESM puro** con el framework **Constatic**, ha sido diseñado para operar como un **Master Data Gateway** entre Discord, la nube y el futuro dashboard web de Vanta.

Con una interfaz de usuario **100% basada en Discord Components V2** y comunicación cifrada de extremo a extremo con **AES-256-GCM**, Vantinha combina protección contra intrusiones, automatizaciones comunitarias y sincronización continua de telemetría.

---

## ⚡ Características Principales

### 🛡️ Sistema Avanzado de Verificación & Gateway de Miembros
- **Integración Web Nativa**: Los paneles generados por el bot emiten tokens temporales de un solo uso válidos por 15 minutos (`/verify?token=...`) para la resolución de desafíos y auditoría de red en el portal oficial.
- **Detección Global de Cuentas Secundarias (Alts)**: Analiza el historial de conexiones y cruza direcciones IP de manera automática, vinculando cuentas alternativas de forma bidireccional.
- **Detección de VPN y Proxies**: Bloqueo o señalización automática de conexiones anónimas sospechosas.
- **Auditoría en Tiempo Real**: Registro detallado de cada intento, hash de IP, User-Agent y sanciones aplicadas en canales dedicados de moderación.

### 🎨 Ley Suprema de UI: 100% Discord Components V2
- Vantinha **ha abolido por completo los Embeds antiguos y las ActionRows sueltas**.
- Todos los mensajes, modales y respuestas de comandos se construyen con `createContainer`, `createSection`, `Separator`, `createTextDisplay` y la flag oficial `MessageFlags.IsComponentsV2`.
- Paleta visual rigurosa con la identidad **Vantablack & Vanta Gold** (`#E5A93C`, `#0a0a0c`, `#7c3aed`).

### 🎭 Sistema Oficial de Emojis Personalizados
- Incluye un catálogo integrado de **59 emojis oficiales de la marca** registrados desde `vh.dog` (identidad, estado, diagnóstico, seguridad, moderación, navegación y controles).
- Prohíbe estrictamente el uso de emojis Unicode genéricos en las interfaces del sistema, asegurando coherencia visual absoluta.

### 🌐 Master Data Gateway (API REST Fastify Integrada)
- Servidor HTTP de alta velocidad y baja latencia integrado directamente en el ciclo de vida del bot durante el evento `clientReady`.
- La aplicación web del dashboard **nunca interactúa directamente con los esquemas sin procesar de la base de datos**: el bot es la Única Fuente de la Verdad.
- Endpoints REST completos para métricas globales (`/api/dashboard/overview`), sincronización de inicios de sesión OAuth (`/api/users/sync`), directorio paginado (`/api/users`), expedientes enriquecidos en vivo (`/api/users/:userId`) y acciones de moderación remota (`kick`, `ban`, `unban`).

### 🔒 Capa de Seguridad y Cifrado E2E (AES-256-GCM)
- Las comunicaciones sensibles entre el dashboard y la API del bot se empaquetan en sobres criptográficos:
  $$\text{Envelope} = \{ \text{iv}, \text{authTag}, \text{data} \}$$
- Protección nativa contra manipulación en tránsito, espionaje, ataques de repetición y falsificación de peticiones.

### 🔄 Auto-Descubrimiento Dinámico de Comandos (`/help`)
- La central de ayuda interactiva detecta y lista de forma automática los nuevos comandos slash registrados en memoria sin necesidad de reprogramar la UI, manteniendo la documentación siempre al día.

---

## 🏗️ Stack Tecnológico y Arquitectura

```
Vanta Bot/
├── src/
│   ├── index.ts               # Punto de entrada y arranque de Constatic
│   ├── env.ts                 # Validación estricta de variables de entorno con Zod
│   ├── constants.ts           # Tokens de diseño, colores oficiales y catálogo de emojis
│   ├── database/              # Persistencia en Google Cloud Firestore mediante Typesaurus
│   │   ├── index.ts           # Inicialización segura con Firebase Admin SDK
│   │   ├── documents/         # Esquemas tipados (GuildDocument, UserDocument, MemberDocument)
│   │   └── functions/         # Lógica de negocio (users, verification, guilds, members)
│   ├── discord/               # Módulos Discord autocargados por Constatic
│   │   ├── commands/          # Comandos Slash (/help, /ping, /counter) en Components V2
│   │   ├── responders/        # Receptores de botones con enrutador radix rou3
│   │   └── events/            # Presencia enriquecida rotativa y registradores de eventos
│   ├── functions/             # Utilidades globales
│   │   ├── crypto.ts          # Motor criptográfico AES-256-GCM y sobres autenticados
│   │   ├── emojis.ts          # Catálogo de emojis personalizados y funciones de consulta
│   │   └── verification.ts    # Paneles V2 y gestión de sesiones temporales OAuth
│   └── server/                # Servidor Fastify integrado
│       ├── index.ts           # Inicialización del servidor en clientReady
│       └── routes/            # Rutas modulares (home, verification, users, dashboard)
├── constants.json             # Definición inmutable de paletas de color y emojis personalizados
├── LICENSE                    # Licencia Propietaria y Anti-Plagio de Software
├── PROJECT_STATE.md           # Memoria de estado continua y ledger del proyecto
└── tsconfig.json              # Configuración TypeScript estricta con alias subpath (#)
```

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | `@constatic/base` + `@magicyan/discord` | Estructura modular, enrutador radix y Discord Components V2 |
| **Motor de Ejecución** | Node.js 22+ / TypeScript 5.7+ | ESM nativo con alias de importación (`#database`, `#functions`, `#env`, etc.) |
| **Base de Datos** | Google Cloud Firestore + `typesaurus` | Persistencia cloud NoSQL con tipado fuerte de extremo a extremo |
| **Servidor Web API** | Fastify 5+ | Comunicación bidireccional de alto rendimiento con el dashboard web |
| **Criptografía** | AES-256-GCM (`node:crypto`) | Sobres cifrados con datos asociados autenticados (AEAD) |
| **Validación** | Zod 3 | Validación rápida de contratos de datos y variables de entorno |

---

## 🚀 Cómo Ejecutar Localmente

### Requisitos Previos
- **Node.js** 22.0.0 o superior instalado.
- Archivo de credenciales de la Cuenta de Servicio de Firebase (`serviceAccount.json` o `firebase.json`) con Cloud Firestore activo.
- Aplicación y Bot configurados en el [Discord Developer Portal](https://discord.com/developers/applications).

### 1. Clonar el Repositorio
```bash
git clone https://github.com/vitordevmm/vantinha.git
cd vantinha
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar las Variables de Entorno
Crea un archivo `.env` basado en [.env.example](file:///.env.example):
```env
# Discord Credentials
BOT_TOKEN="TU_DISCORD_BOT_TOKEN"
BOT_ID="1567751920645308548"

# Firestore Database (Ruta del archivo Service Account JSON)
FIREBASE_PATH="./serviceAccount.json"

# API Server Config (Fastify)
SERVER_PORT=8080

# Dashboard & API Security (Claves Maestras)
DASHBOARD_URL="http://localhost:3000"
API_SECRET_KEY="tu_clave_secreta_api"
API_ENCRYPTION_KEY="tu_clave_criptografica_aes256"

NODE_ENV="development"
```

> ⚠️ **Importante:** Los archivos `.env`, `firebase.json` y `serviceAccount.json` están protegidos en `.gitignore` y **nunca** deben cometerse al repositorio.

### 4. Verificar Tipado y Sintaxis
```bash
npm run check
```

### 5. Iniciar en Modo de Desarrollo (Watch Mode Nativo)
```bash
npm run dev
```
Vantinha arrancará con hot-reload nativo, observando cambios en `./src`, autenticándose con Firestore y levantando el servidor Fastify en el puerto configurado.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el bot en modo de desarrollo con hot-reload nativo (`node --watch`) |
| `npm run check` | Ejecuta el comprobador de tipos de TypeScript (`tsc --noEmit`) asegurando 0 errores |
| `npm run build` | Compila el proyecto TypeScript a JavaScript puro en el directorio `/build` |
| `npm start` | Ejecuta el bot compilado en entorno de producción |

---

## 🔒 Gobernanza y Ledger del Proyecto

El desarrollo sigue de forma estricta el protocolo documentado en [PROJECT_STATE.md](file:///PROJECT_STATE.md):
1. Lectura obligatoria de convenciones y estado previo a cualquier modificación.
2. Comprobación prévia `npm run check` con 0 errores antes de arrancar.
3. Auditoría activa de la terminal durante los primeros 10 segundos tras el inicio.
4. Registro de actualizaciones enumeradas (`[Update #XXX]`) detallando los archivos modificados.
5. Cumplimiento de la **Ley Suprema de UI: 100% Discord Components V2**, la **Ley de Sigilo del Backend** (cero divulgación de infraestructura interna a usuarios finales) y la **Ley de Emojis Personalizados**.

---

## ⚖️ Licencia y Propiedad Intelectual (Anti-Plagio)

Este proyecto está protegido bajo una **Licencia Propietaria y Anti-Plagio Estricta** (`ALL RIGHTS RESERVED`).
- **Copyright (c) 2026 Vitor Dev (vitordevmm) & Vanta Ecosystem**.
- Queda **estrictamente prohibido** copiar, plagiar, duplicar, redistribuir, sublicenciar o comercializar cualquier parte de este código, arquitectura o elementos visuales bajo otro nombre sin autorización previa por escrito del autor.
- El código fuente en este repositorio se publica exclusivamente con fines de transparencia, portafolio y auditoría de seguridad.
- Para conocer los términos legales completos, consulte el archivo [LICENSE](LICENSE).

---

<div align="center">
  <sub>Desarrollado con excelencia para el ecosistema <b>Vanta</b>.</sub>
</div>
