import { Kysely } from "kysely";
import { env } from "../utils/worker-env";
import { D1Dialect } from "./d1-kysely";

export let db: Kysely<unknown>;

export async function initializeDb() {
  db = new Kysely<unknown>({
    dialect: new D1Dialect(env.db),
  });
}
