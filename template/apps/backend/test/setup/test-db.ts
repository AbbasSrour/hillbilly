import { MikroORM } from "@mikro-orm/core";

export async function clearDatabase(orm: MikroORM): Promise<void> {
  const connection = orm.em.getConnection();

  const tables = Object.values(orm.getMetadata().getAll())
    .filter((meta) => meta.tableName && !meta.abstract)
    .map((meta) => `"${meta.tableName}"`);

  if (tables.length > 0) {
    await connection.execute(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
  }
}

export async function clearTables(orm: MikroORM, tableNames: string[]): Promise<void> {
  if (tableNames.length === 0) return;

  const connection = orm.em.getConnection();
  const quotedTables = tableNames.map((t) => `"${t}"`).join(", ");

  await connection.execute(`TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE`);
}
