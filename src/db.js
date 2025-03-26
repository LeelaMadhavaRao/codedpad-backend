import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
let db;
async function connectToDB(cb) {
    const url = process.env.MONGO_URL;
    const client = new MongoClient(url);
    await client.connect();
    db = client.db("codedpad");
    cb();
}

// connectToDB()

export { connectToDB, db };