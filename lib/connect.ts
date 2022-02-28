import * as config from 'config'

import * as mongodb from 'mongodb'
const mongoUrl = "mongodb://" + config.mongodb.host + ':' + config.mongodb.port

let db : mongodb.Db

export function setup() : Promise<mongodb.Db> {
    if(db){
        return Promise.resolve(db).then((db) => {
            return db
        })
    }
    else{
        return mongodb.MongoClient.connect(mongoUrl).then(client => {
            db = client.db(config.mongodb.name)
            return db
        })
    }
}
