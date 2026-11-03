import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';
import { seedIfEmpty } from './seed';

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
  await seedIfEmpty(database);
}