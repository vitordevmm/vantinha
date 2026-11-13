import { env } from "#env";
import "#server";
import { bootstrap } from "@constatic/base";

await bootstrap({ meta: import.meta, env });
