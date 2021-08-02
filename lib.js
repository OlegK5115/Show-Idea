const mongodb = require("mongodb")
const mongoUrl = "mongodb://localhost:27017/"
const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true }

/**
 * @type {mongodb.Collection<any>}
 */
let collection

function setup() {
    // проверять режим базы данных testing

    // !!!

    return mongodb.MongoClient.connect(mongoUrl, mongoParams).then(client => {
        collection = client.db('DataBase').collection('ideas')
        return true
    })
}

exports.setup = setup

function getLength() {
    return collection.find({}).toArray().then(result => {
        return result.length
    })
}

exports.getLength = getLength

function saveIdea(newIdea) {
    if (newIdea.heading == "" || newIdea.content == ""){
        throw new Error("Wrong Idea")
    }
    else {
       const idea = {heading : newIdea.heading, content : newIdea.content, support : 0}
       return collection.insertOne(idea)
        .then(result => {
            return result.insertedId
        })
    }
}

exports.saveIdea = saveIdea

function getAllIdeas() {
    return collection
        .find()
        .sort( {support : -1} ) // сортирует массив по призаку (1 - по возрастанию, -1 - по убыванию)
        .toArray()
}

exports.getAllIdeas = getAllIdeas

function showIdea(id) {
    return collection.findOne({_id : new mongodb.ObjectId(id)})
    .then(result => {
        if(result == null){
            return {status : false}
        }
        else{
            let name = result.heading
            let content = result.content
            return {status : true, heading : name, content : content}
        }
    })
}

exports.showIdea = showIdea

function ideaUp(id) {
    return collection.findOneAndUpdate(
        {_id : new mongodb.ObjectId(id)},
        {$inc : {support : 1}})
        .then(() => {
            return collection.findOne(
                {_id : new mongodb.ObjectId(id)})
                .then(result => { return result.support })
        })
}

exports.ideaUp = ideaUp

function ideaDown(id) {
    return collection.findOneAndUpdate(
        {_id : new mongodb.ObjectId(id)},
        {$inc : {support : -1}})
        .then(() => {
            return collection.findOne(
                {_id : new mongodb.ObjectId(id)})
                .then(result => { return result.support })
        })
}

exports.ideaDown = ideaDown

function clearIdeas() {
    return collection.deleteMany({})
}

exports.clearIdeas = clearIdeas