const mongodb = require("mongodb")
const mongoUrl = "mongodb://localhost:27017/"
const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true }

const users = require('./users')

/**
 * @type {mongodb.collection<any>}
 */
let client
let ideas


function setup() {
    // проверять режим базы данных testing

    // !!!

    return mongodb.MongoClient.connect(mongoUrl, mongoParams).then(result => {
        client = result
        ideas = client.db('DataBase').collection('ideas')
        return true
    })
}

exports.setup = setup

function getLength() {
    return ideas.find({}).toArray().then(result => {
        return result.length
    })
}

exports.getLength = getLength

function saveIdea(newIdea, email) {
    const result = {}
    if (newIdea.heading == "" || newIdea.content == ""){
        result.message = "Wrong Idea"
        result.status = false
        return result    
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

exports.saveIdea = saveIdea

function getAllIdeas() {
    return ideas
        .find()
        .sort( {support : -1} ) // сортирует массив по призаку (1 - по возрастанию, -1 - по убыванию)
        .toArray()
}

exports.getAllIdeas = getAllIdeas

function showIdea(id) {
    return ideas.findOne({_id : new mongodb.ObjectId(id)})
    .then(result => {
        if(result == null){
            return {status : false}
        }
        else{
            let name = result.heading
            let content = result.content
            return {status : true, heading : name, content : content, id : id}
        }
    })
}

exports.showIdea = showIdea

function ideaUp(mail, ideaid) {
    const result = {}
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
                    result.support = resultsBoolsAndIdea.support
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
                    result.support = resultsBoolAndIdea.support
                    return result
                    /* session.commitTransaction()
                    session.endSession() */
                }
            })
        }
    })
}

exports.ideaUp = ideaUp

function ideaDown(mail, ideaid) {
    const result = {}
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
                    result.support = resultsBoolsAndIdea.support
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
                    result.support = resultsBoolAndIdea.support
                    return result
                    /* session.commitTransaction()
                    session.endSession() */
                }
            })
        }
    })
}

exports.ideaDown = ideaDown

function clearIdeas() {
    return ideas.deleteMany({})
}

exports.clearIdeas = clearIdeas
