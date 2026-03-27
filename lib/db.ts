import Database from 'better-sqlite3'

let dbInstance: Database.Database | null = null

export function getDB() {
  if (dbInstance) {
    return dbInstance
  }

  const dbPath = process.env.SQLITE_DB_PATH || 'subslash.db'
  const db = new Database(dbPath)

  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run()

  dbInstance = db
  return db
}
