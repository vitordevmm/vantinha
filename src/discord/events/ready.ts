import { createEvent } from "#base";
import ck from "chalk";

createEvent({
    name: "Vantinha Ready Logger",
    event: "clientReady",
    once: true,
    async run(client) {
        console.log(
            ck.magentaBright(`🌌 [Vantinha] Conectado com sucesso como `) +
            ck.bold.cyan(client.user.tag) +
            ck.gray(` (ID: ${client.user.id})`)
        );
        console.log(
            ck.gray(`● Servidores ativos: `) + ck.yellow(client.guilds.cache.size) +
            ck.gray(` | Usuários em cache: `) + ck.yellow(client.users.cache.size)
        );

        // Pré-aquece o cache de comandos na inicialização para resposta instantânea no /help
        await client.application?.commands.fetch().catch(() => null);
    }
});
