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

export interface Result {
    status : Boolean,
    message ?: String,
    support ?: number
}

export type ResultWithID = Result & {
    ideaId : mongodb.ObjectId
}

export type ResultWithIdea = Result & {
    idea : Idea
}

export type ResultWithSupport = Result & {
    support : number
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

export async function saveIdea(newIdea, email) : Promise<ResultWithID> {
    let result : ResultWithID = {
        status : true,
        message : "",
        ideaId : null
    }
    
    if(!email){
        result.status = false
        result.message = "Wrong email"
        return result
    }
    if (!(!!newIdea.heading && !!newIdea.content)){
        result.message = "Wrong Idea"
        result.status = false
        return result
    }
    const user = await users.getUserByEmail(email)
    if(!user) {
        result.message = "Wrong email"
        result.status = false
        return result
    }
    const authorId = user._id
    const idea = {heading : newIdea.heading, content : newIdea.content, support : 0, authorId : authorId}
    const resIdea = await ideas.insertOne(idea)
    result.message = "Added idea"
    result.status = true
    result.ideaId = resIdea.insertedId
    return result
}

export function getAllIdeas() {
    return ideas
        .find()
        .sort( {support : -1} )
        .toArray()
}

export async function showIdea(id : string) : Promise<ResultWithIdea> {
    let result : ResultWithIdea = {
        status : true,
        idea : null
    }
    const resultIdea = await ideas.findOne({_id : new mongodb.ObjectId(id)})
    if(resultIdea == null){
        result.status = false
    }
    else {
        result.idea = resultIdea
    }
    return result
}

export async function ideaUp(mail, ideaid) : Promise<ResultWithSupport> {
    let result : ResultWithSupport = {
        status : true,
        support : null
    }
    const resultBool1 = await users.findIdeasSupport(mail, ideaid)
    const resultBool2 = await users.findIdeasUnsupport(mail, ideaid)

    if(!resultBool1 && !resultBool2) {
        await ideas.findOneAndUpdate( {_id : new mongodb.ObjectId(ideaid)},
        {$inc : {support : 1}}),
        await users.pushSupport(mail, ideaid)
        const idea = await ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
        result.status = true
        result.support = idea.support
        return result
    }
    else if(resultBool2){
        const resultIdea = await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : 2}
        })

        if(await users.pullUnsupport(mail, ideaid) && await users.pushSupport(mail, ideaid)) {
            const idea = await ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
            result.status = true
            result.support = idea.support
            return result
        }
        else {
            result.status = false
            result.support = resultIdea.value.support
            return result
        }
    }
    else {
        const resultIdea = await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : -1}
        })

        if (await users.pullSupport(mail, ideaid)) {
            const idea = await ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
            result.status = true
            result.support = idea.support
            return result
        }
        else {
            result.status = false
            result.support = resultIdea.value.support
            return result
        }
    }
}

export async function ideaDown(mail, ideaid) : Promise<ResultWithSupport> {
    let result : ResultWithSupport = {
        status : true,
        support : null
    }
    const resultBool1 = await users.findIdeasSupport(mail, ideaid)
    const resultBool2 = await users.findIdeasUnsupport(mail, ideaid)
    if(!resultBool1 && !resultBool2){
        await ideas.findOneAndUpdate({_id : new mongodb.ObjectId(ideaid)},
        {$inc : {support : -1}})
        await users.pushUnsupport(mail, ideaid)
        const idea = await ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
        result.status = true
        result.support = idea.support
        return result
    }
    else if(resultBool1){
        const resultIdea = await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : -2}
        })
        
        if(await users.pullSupport(mail, ideaid) && await users.pushUnsupport(mail, ideaid)) {
            const idea = await ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
            result.status = true
            result.support = idea.support
            return result
        }
        else {
            result.status = false
            result.support = resultIdea.value.support
            return result
        }
    }
    else {
        const resultIdea = await ideas.findOneAndUpdate(
            {_id : new mongodb.ObjectId(ideaid)},
            {$inc : {support : 1}
        })
        if(await users.pullUnsupport(mail, ideaid)) {
            const idea = await ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
            result.status = true
            result.support = idea.support
            return result
        }
        else{
            result.status = false
            result.support = resultIdea.value.support
            return result
        }
    }
}

export function clearIdeas() {
    return ideas.deleteMany({})
}
