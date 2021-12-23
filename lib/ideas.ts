import * as mongodb from 'mongodb'

const mongoUrl = "mongodb://localhost:27017/"

import * as users from '../lib/users'

export interface Idea {
    heading : String,
    content : String,
    id ?: mongodb.ObjectId
}

interface Result {
    status : Boolean,
    message ?: String,
    id ?: String,
    support ?: number
}


/**
 * @type {mongodb.collection<any>}
 */
let client
let ideas


export function setup() {
    // проверять режим базы данных testing

    // !!!

    return mongodb.MongoClient.connect(mongoUrl).then(result => {
        client = result
        ideas = client.db('DataBase').collection('ideas')
        return true
    })
}

export function getLength() {
    return ideas.count().then(result => {
        return result
    })
}

export function saveIdea(newIdea, email) {
    let result : Result = {
        status : true
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
            result.id = resIdea.insertedId
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

export function showIdea(id) {
    return ideas.findOne({_id : new mongodb.ObjectId(id)})
    .then(result => {
        if(result == null){
            return {status : false}
        }
        else{
            let name : String = result.heading
            let content : String = result.content
            return {status : true, heading : name, content : content, id : id}
        }
    })
}

export function ideaUp(mail, ideaid) {
    let result : Result = {
        status : true
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
                    result.support = resultsBoolsAndIdea[0].support
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
                    result.support = resultsBoolAndIdea[0].support
                    return result
                    /* session.commitTransaction()
                    session.endSession() */
                }
            })
        }
    })
}

export function ideaDown(mail, ideaid) {
    let result : Result = {
        status : true
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
                    result.support = resultsBoolsAndIdea[0].support
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
                    result.support = resultsBoolAndIdea[0].support
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
