import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';
import { seedCatalogue } from './seed';

const CATALOGUE_VERSION = 2; // increase this number whenever seed.js changes

let db;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('episodex.db');
  }
  return db;
}

export async function initDatabase() {
  const database = await getDb();
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync(SCHEMA);

  const { user_version } = await database.getFirstAsync('PRAGMA user_version');
  if (user_version < CATALOGUE_VERSION) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(
        `DELETE FROM episode_progress;
         DELETE FROM library;
         DELETE FROM episodes;
         DELETE FROM seasons;
         DELETE FROM titles;`
      );
      await seedCatalogue(database);
    });
    await database.execAsync(`PRAGMA user_version = ${CATALOGUE_VERSION};`);
  }
}