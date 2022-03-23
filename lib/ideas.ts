import * as mongodb from 'mongodb'

import * as connect from '../lib/connect'
import * as users from '../lib/users'

export interface Idea {
    heading : String,
    content : String,
    support ?: number,
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
        support : 0,
        authorId : authorId
    }
    return (await ideas.insertOne(idea)).insertedId
}

export function getAllIdeas() {
    return ideas
        .find()
        .sort( {support : -1} )
        .toArray()
}

export async function showIdea(id : string) : Promise<Idea> {
    return await ideas.findOne({_id : new mongodb.ObjectId(id)})
}

export async function ideaUp(mail, ideaid) : Promise<number> {
    const resultBool1 = await users.findIdeasSupport(mail, ideaid)
    const resultBool2 = await users.findIdeasUnsupport(mail, ideaid)

    if(!resultBool1 && !resultBool2) {
        await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : 1}}
        )
        await users.pushSupport(mail, ideaid)
        const idea = await ideas.findOne({
            _id : new mongodb.ObjectId(ideaid)
        })
        return idea.support
    }
    else if(resultBool2){
        await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : 2}
        })

        if(!await users.pullUnsupport(mail, ideaid)){
            throw new Error("Error pull unsupport")
        }
        if(!await users.pushSupport(mail, ideaid)) {
            throw new Error("Error push support")
        }
        const idea = await ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
        return idea.support
    }
    else {
        await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : -1}}
        )

        if (!await users.pullSupport(mail, ideaid)) {
            throw new Error("Error pull support")
        }
        const idea = await ideas.findOne({
            _id : new mongodb.ObjectId(ideaid)
        })
        return idea.support
    }
}

export async function ideaDown(mail, ideaid) : Promise<number> {
    const resultBool1 = await users.findIdeasSupport(mail, ideaid)
    const resultBool2 = await users.findIdeasUnsupport(mail, ideaid)
    if(!resultBool1 && !resultBool2){
        await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : -1}}
        )
        await users.pushUnsupport(mail, ideaid)
        const idea = await ideas.findOne({
            _id : new mongodb.ObjectId(ideaid)
        })
        return idea.support
    }
    else if(resultBool1){
        await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : -2}
        })
        
        if(!await users.pullSupport(mail, ideaid)){
            throw new Error("Error pull support")
        }
        if(!await users.pushUnsupport(mail, ideaid)){
            throw new Error("Error push unsupport")
        }
        const idea = await ideas.findOne({
            _id : new mongodb.ObjectId(ideaid)
        })
        return idea.support
    }
    else {
        await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : 1}
        })
        if(!await users.pullUnsupport(mail, ideaid)) {
            throw new Error("Error pull unsupport")
        }
        const idea = await ideas.findOne({
            _id : new mongodb.ObjectId(ideaid)
        })
        return idea.support
    }
}

export function clearIdeas() {
    return ideas.deleteMany({})
}
