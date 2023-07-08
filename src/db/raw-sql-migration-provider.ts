import fs from "node:fs";
import { tinyassert } from "@hiogawa/utils";
import { type Migration, type MigrationProvider, sql } from "kysely";

export class RawSqlMigrationProvider implements MigrationProvider {
  constructor(private options: { directory: string }) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const baseDir = this.options.directory;
    const nameDirs = await fs.promises.readdir(baseDir);
    for (const name of nameDirs) {
      const upFile = `${baseDir}/${name}/up.sql`;
      const downFile = `${baseDir}/${name}/down.sql`;
      tinyassert(fs.existsSync(upFile));
      migrations[name] = {
        up: await readSqlFile(upFile),
        down: fs.existsSync(downFile) ? await readSqlFile(downFile) : undefined,
      };
    }
    return migrations;
  }
}

async function readSqlFile(filepath: string): Promise<Migration["up"]> {
  const content = await fs.promises.readFile(filepath, "utf-8");
  return async (db) => {
    await sql.raw(content).execute(db);
  };
}

// import glob raw??
