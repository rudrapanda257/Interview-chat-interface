import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL!;
const options = {};

const client = new MongoClient(uri, options);
const clientPromise = client.connect();

export default clientPromise;
