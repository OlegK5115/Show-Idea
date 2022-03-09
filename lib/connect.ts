import * as config from 'config'

import * as mongodb from 'mongodb'
const mongoUrl = "mongodb://" + config.mongodb.host + ':' + config.mongodb.port

let db : mongodb.Db

export async function setup() : Promise<mongodb.Db> {
    if(!db) {
        const client = await mongodb.MongoClient.connect(mongoUrl)
        db = client.db(config.mongodb.name)
    }
    return db
}
