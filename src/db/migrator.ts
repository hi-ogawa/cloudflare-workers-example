//
// zero-dependency simplified/generalized version of kysely Migrator
// https://github.com/kysely-org/kysely/blob/b7c7f37ad109e377e6cf5e4aefeb1524d735e554/src/migration/migrator.ts#L494-L499
//

type Options<I> = {
  provider: () => Promise<MigrationRequest<I>[]>;
  driver: {
    init: () => Promise<void>;
    select: () => Promise<MigrationState[]>;
    insert: (result: MigrationState) => Promise<void>;
    delete: (result: Pick<MigrationState, "name">) => Promise<void>;
    run: (input: I) => Promise<void>;
  };
};

type MigrationRequest<I> = {
  name: string;
  up: I;
  down?: I;
};

interface MigrationState {
  name: string;
  executedAt: string;
}

type MigrationRequestStateMap<I> = Map<
  string,
  {
    request: MigrationRequest<I>;
    state?: MigrationState;
  }
>;

interface MigrationResult {
  name: string;
  direction: "up" | "down";
  status: "success" | "error";
}

export interface MigrationResultSet {
  error?: unknown;
  results: MigrationResult[];
}

export class Migrator<T> {
  constructor(private options: Options<T>) {}

  async init() {
    await this.options.driver.init();
  }

  async status() {
    return await this.getRequestStateMap();
  }

  async up(): Promise<MigrationResultSet> {
    const { pending } = await this.getRequestStateMap();
    return this.runMany(pending.slice(0, 1), "up");
  }

  async down(): Promise<MigrationResultSet> {
    const { completed } = await this.getRequestStateMap();
    return this.runMany(completed.reverse(), "down");
  }

  async latest(): Promise<MigrationResultSet> {
    const { pending } = await this.getRequestStateMap();
    return this.runMany(pending, "up");
  }

  private async getRequestStateMap() {
    const requests = await this.options.provider();
    const states = await this.options.driver.select();
    const map: MigrationRequestStateMap<T> = new Map();
    for (const request of requests) {
      map.set(request.name, {
        request,
        state: states.find((s) => s.name === request.name),
      });
    }

    // check missing request
    const missings = states.filter((s) => !map.has(s.name));
    if (missings.length > 0) {
      console.error(
        "[WARNING] already applied migrations are not found:\n" +
          missings.map((s) => s.name).join("\n"),
      );
    }

    const pending = [...map.values()]
      .filter((e) => !e.state)
      .map((e) => e.request);

    // order by `executedAt` instead of `name` (similar to knex's `id` ordering)
    const completed = [...map.values()]
      .filter((e) => e.state)
      .sort((l, r) => l.state!.executedAt.localeCompare(r.state!.executedAt))
      .map((e) => e.request);

    return { map, pending, completed };
  }

  private async runMany(
    requests: MigrationRequest<T>[],
    direction: "up" | "down",
  ) {
    const resultSet: MigrationResultSet = { results: [] };
    for (const request of requests) {
      try {
        await this.runSingle(request, direction);
        resultSet.results.push({
          name: request.name,
          direction,
          status: "success",
        });
      } catch (e) {
        resultSet.error = e;
        resultSet.results.push({
          name: request.name,
          direction,
          status: "error",
        });
        break;
      }
    }
    return resultSet;
  }

  private async runSingle(
    request: MigrationRequest<T>,
    direction: "up" | "down",
  ) {
    await this.options.driver.run(request.up);
    if (direction === "up") {
      const executedAt = new Date().toISOString();
      await this.options.driver.insert({ name: request.name, executedAt });
    } else {
      await this.options.driver.delete({ name: request.name });
    }
  }
}

//
// raw sql provider/driver
//

export function rawSqlMigrationProvider(options: {
  directory: string;
}): Options<string>["provider"] {
  return async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const requests: MigrationRequest<string>[] = [];

    const nameDirs = await fs.promises.readdir(options.directory, {
      withFileTypes: true,
    });
    for (const nameDir of nameDirs) {
      if (!nameDir.isDirectory()) {
        continue;
      }
      const nameDirPath = path.join(options.directory, nameDir.name);
      const files = await fs.promises.readdir(nameDirPath);
      const foundUp = files.find((f) => f === "up.sql");
      const foundDown = files.find((f) => f === "down.sql");
      if (!foundUp) {
        throw new Error(`'up.sql' not found in '${nameDirPath}'`);
      }
      requests.push({
        name: nameDir.name,
        up: await fs.promises.readFile(
          path.join(nameDirPath, foundUp),
          "utf-8",
        ),
        down: foundDown
          ? await fs.promises.readFile(
              path.join(nameDirPath, foundDown),
              "utf-8",
            )
          : undefined,
      });
    }

    requests.sort((l, r) => l.name.localeCompare(r.name));
    return requests;
  };
}

export function rawSqlMigrationDriver(options: {
  table: string;
  execute: (query: string) => Promise<unknown[]>;
  executeRaw: (query: string) => Promise<void>;
}): Options<string>["driver"] {
  // TODO: escape/binding
  return {
    init: async () => {
      await options.executeRaw(`\
        CREATE TABLE IF NOT EXISTS ${options.table} (
          name       VARCHAR(128) NOT NULL PRIMARY KEY,
          executedAt VARCHAR(128) NOT NULL
        )
      `);
    },

    select: async () => {
      try {
        const rows = await options.execute(
          `SELECT * FROM ${options.table} ORDER BY name`,
        );
        return rows as MigrationState[];
      } catch (e) {
        console.error("* did you forget to run 'init'?");
        throw e;
      }
    },

    insert: async (state) => {
      await options.execute(
        `INSERT INTO ${options.table} (name, executedAt) VALUES ('${state.name}', '${state.executedAt}')`,
      );
    },

    delete: async (state) => {
      await options.execute(
        `DELETE FROM ${options.table} WHERE name = '${state.name}'`,
      );
    },

    run: async (query) => {
      await options.executeRaw(query);
    },
  };
}
