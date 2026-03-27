import fs from 'fs'
import path from 'path'

export interface StoredUser {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
}

const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readUsers(): StoredUser[] {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    return []
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as StoredUser[]
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const users = readUsers()
  return users.find((u) => u.email === email)
}

export function createUser(user: StoredUser): void {
  const users = readUsers()
  users.push(user)
  writeUsers(users)
}
