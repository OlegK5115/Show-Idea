import * as mongodb from 'mongodb'

import * as connect from '../lib/connect'
import * as users from '../lib/users'

export interface Idea {
    heading : String,
    content : String,
    authorId ?: mongodb.ObjectId,
    _id ?: mongodb.ObjectId
}

let ideas : mongodb.Collection<Idea>


export async function setup() : Promise<Boolean> {
    const db = await connect.setup()
    ideas = db.collection('ideas')
    return true
}

export async function getLength() : Promise<number> {
    return await ideas.countDocuments()
}

export async function saveIdea(newIdea, email) : Promise<mongodb.ObjectId> {
    if(!email) {
        throw new Error("Missing email")
    }
    else if(!newIdea.heading){
        throw new Error("Missing heading")
    }
    else if(!newIdea.content) {
        throw new Error("Missing content")
    }
    const user = await users.getUserByEmail(email)
    if(!user) {
        return null
    }
    const authorId = user._id
    const idea = {
        heading : newIdea.heading,
        content : newIdea.content,
        authorId : authorId
    }
    return (await ideas.insertOne(idea)).insertedId
}

export function getAllIdeas() {
    return ideas
        .find()
        .toArray()
}

export async function getIdeaByID(id) : Promise<Idea> {
    if(typeof(id) == 'string') {
        id = new mongodb.ObjectId(id)
    }

    if(!id){
        throw new Error("Missing id")
    }

    return await ideas.findOne({
        _id : id
    })
}

export function clearIdeas() {
    return ideas.deleteMany({})
}
