import type { Generated } from "kysely";

export interface KyselyTables {
  counter: {
    id: Generated<number>;
    value: number;
  };
}
