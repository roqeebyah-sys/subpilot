import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

// This tells TypeScript that we're storing the mongoose
// connection on the global object to reuse it across requests
declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null
    promise: Promise<typeof import('mongoose')> | null
  }
}

// Initialise the cache if it doesn't exist yet
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  // If we already have a connection, reuse it
  if (cached.conn) {
    return cached.conn
  }

  // If no connection is being established yet, start one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // don't queue commands if disconnected
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  // Wait for the connection and cache it
  cached.conn = await cached.promise
  return cached.conn
}