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

interface Result {
    status : Boolean,
    message ?: String,
    support ?: number
}

let ideas : mongodb.Collection<Idea>


export function setup() : Promise<Boolean> {

    return connect.setup().then(db => {
        ideas = db.collection('ideas')
        return true
    })
}

export function getLength() : Promise<number> {
    return ideas.countDocuments().then(result => {
        return result
    })
}

type ResultWithID = Result & {
    ideaId : mongodb.ObjectId
}

export function saveIdea(newIdea, email) : Promise<ResultWithID> | Promise<Result> {
    let result : ResultWithID = {
        status : true,
        ideaId : null
    }
    if(!email){
        result.status = false
        result.message = "Wrong email"
        return Promise.resolve(result).then(() => {
            return result
        })
    }
    if (!(!!newIdea.heading && !!newIdea.content)){
        result.message = "Wrong Idea"
        result.status = false
        return Promise.resolve(result).then(() => {
            return result
        }) 
    }
    return users.getUserByEmail(email).then(user => {
        if(!user) {
            result.message = "Wrong email"
            result.status = false
            return result
        }
        const authorId = user._id
        const idea = {heading : newIdea.heading, content : newIdea.content, support : 0, authorId : authorId}
        return ideas.insertOne(idea)
        .then(resIdea => {
            result.message = "Added idea"
            result.status = true
            result.ideaId = resIdea.insertedId
            return result
        })
    })
}

export function getAllIdeas() {
    return ideas
        .find()
        .sort( {support : -1} ) // сортирует массив по призаку (1 - по возрастанию, -1 - по убыванию)
        .toArray()
}

type ResultWithIdea = Result & {
    idea : Idea
}

export function showIdea(id : string) : Promise<ResultWithIdea> | Promise<Result> {
    let result : ResultWithIdea = {
        status : true,
        idea : null
    }
    return ideas.findOne({_id : new mongodb.ObjectId(id)})
    .then(resultIdea => {
        if(resultIdea == null){
            result.status = false
            return result
        }
        else {
            result.idea = resultIdea
            return result
        }
    })
}

type ResultWithSupport = Result & {
    support : number
}

export function ideaUp(mail, ideaid) : Promise<ResultWithSupport> {
    let result : ResultWithSupport = {
        status : true,
        support : null
    }
    /* const session = client.startSession()
    session.withTransaction()
    .then(() => {}) */
    return Promise.all([users.findIdeasSupport(mail, ideaid),
        users.findIdeasUnsupport(mail, ideaid)])
    .then(rezults => {
        if(!rezults[0] && !rezults[1]){
            return Promise.all([
                ideas.findOneAndUpdate( {_id : new mongodb.ObjectId(ideaid)},
                {$inc : {support : 1}}),
                users.pushSupport(mail, ideaid)
            ]).then(() => {
                return ideas.findOne(
                    {_id : new mongodb.ObjectId(ideaid)})
                .then(idea => {
                    result.status = true
                    result.support = idea.support
                    return result
                    /*session.commitTransaction()
                    session.endSession() */
                })
            })
        }
        else if(rezults[1]){
            return Promise.all([
                ideas.findOneAndUpdate( {_id : new mongodb.ObjectId(ideaid)},
                {$inc : {support : 2}}),
                users.pullUnsupport(mail, ideaid),
                users.pushSupport(mail, ideaid)
            ]).then(resultsBoolsAndIdea => {
                if(resultsBoolsAndIdea[1] && resultsBoolsAndIdea[2]){
                    return ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
                    .then(idea => {
                        result.status = true
                        result.support = idea.support
                        return result
                        /*session.commitTransaction()
                        session.endSession() */
                    })
                }
                else {
                    result.status = false
                    result.support = resultsBoolsAndIdea[0].value.support
                    return result
                    /*session.commitTransaction()
                    session.endSession() */
                }
            })
        }
        else {
            return Promise.all([
                ideas.findOneAndUpdate( {_id : new mongodb.ObjectId(ideaid)},
                {$inc : {support : -1}}),
                users.pullSupport(mail, ideaid)
            ]).then(resultsBoolAndIdea => {
                if(resultsBoolAndIdea[1]){
                    return ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
                    .then(idea => {
                        result.status = true
                        result.support = idea.support
                        return result
                        /*session.commitTransaction()
                        session.endSession() */
                    })
                }
                else{
                    result.status = false
                    result.support = resultsBoolAndIdea[0].value.support
                    return result
                    /* session.commitTransaction()
                    session.endSession() */
                }
            })
        }
    })
}

export function ideaDown(mail, ideaid) : Promise<ResultWithSupport> {
    let result : ResultWithSupport = {
        status : true,
        support : null
    }
    /*const session = client.startSession()
    session.withTransaction()
    .then(() => {}) */
    return Promise.all([users.findIdeasSupport(mail, ideaid),
        users.findIdeasUnsupport(mail, ideaid)])
    .then(rezults => {
        if(!rezults[0] && !rezults[1]){
            return Promise.all([ideas.findOneAndUpdate( {_id : new mongodb.ObjectId(ideaid)},
                {$inc : {support : -1}}),
                users.pushUnsupport(mail, ideaid)
            ]).then(() => {
                return ideas.findOne(
                    {_id : new mongodb.ObjectId(ideaid)})
                .then(idea => {
                    result.status = true
                    result.support = idea.support
                    return result
                    /*session.commitTransaction()
                    session.endSession() */
                })
            })
        }
        else if(rezults[0]){
            return Promise.all([
                ideas.findOneAndUpdate( {_id : new mongodb.ObjectId(ideaid)},
                {$inc : {support : -2}}),
                users.pullSupport(mail, ideaid),
                users.pushUnsupport(mail, ideaid)
            ]).then(resultsBoolsAndIdea => {
                if(resultsBoolsAndIdea[1] && resultsBoolsAndIdea[2]){
                    return ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
                    .then(idea => {
                        result.status = true
                        result.support = idea.support
                        return result
                        /* session.commitTransaction()
                        session.endSession() */
                    })
                }
                else {
                    result.status = false
                    result.support = resultsBoolsAndIdea[0].value.support
                    return result
                    /* session.commitTransaction()
                    session.endSession() */
                }
            })
        }
        else {
            return Promise.all([
                ideas.findOneAndUpdate( {_id : new mongodb.ObjectId(ideaid)},
                {$inc : {support : 1}}),
                users.pullUnsupport(mail, ideaid)
            ]).then(resultsBoolAndIdea => {
                if(resultsBoolAndIdea[1]){
                    return ideas.findOne({_id : new mongodb.ObjectId(ideaid)})
                    .then(idea => {
                        result.status = true
                        result.support = idea.support
                        return result
                        /* session.commitTransaction()
                        session.endSession() */
                    })
                }
                else{
                    result.status = false
                    result.support = resultsBoolAndIdea[0].value.support
                    return result
                    /* session.commitTransaction()
                    session.endSession() */
                }
            })
        }
    })
}

export function clearIdeas() {
    return ideas.deleteMany({})
}
