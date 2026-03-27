import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.MONGODB_DB_NAME || 'subslash_db'

let cachedClient: MongoClient | null = null

export async function getMongoClient() {
  if (cachedClient && cachedClient.isConnected?.()) {
    return cachedClient
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  cachedClient = client
  return client
}

export async function getDatabase() {
  const client = await getMongoClient()
  return client.db(DB_NAME)
}
