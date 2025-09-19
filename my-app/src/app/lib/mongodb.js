// lib/mongodb.js
import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://Shubham:NITa%401234@cluster0.z5xy2.mongodb.net/DB_ASSI";
if (!MONGODB_URI) throw new Error("MONGODB_URI is required.");

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// ✅ this function returns a collection
export async function connectDB() {
  const client = await clientPromise;
  const db = client.db("DB_ASSI"); // your DB name
  return db.collection("Companies"); // your collection
}
