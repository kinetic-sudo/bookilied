import { error } from "console";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if(!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI in enviroment variable')
}

declare global {
    var MongooseCache: {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
    }
}

let cached = global.MongooseCache || (global.MongooseCache = {conn: null, promise: null});

export const connectToDatabase = async () => {
    if(cached.conn) return cached.conn;

    if(!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false
        })
    }
    try{ 
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null
        console.error('Mongodb connecttion error please make sure Mongodb is running' +  e)
        throw e
    }
      console.info('connected to Mongodb')
      return cached.conn
    }

