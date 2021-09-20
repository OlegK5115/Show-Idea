const mongodb = require("mongodb")
const mongoUrl = "mongodb://localhost:27017/"
const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true }

const ideas = require('./ideas')

/**
 * @type {mongodb.collection<any>}
 */
let users


function setup() {
    // проверять режим базы данных testing

    // !!!

    return mongodb.MongoClient.connect(mongoUrl, mongoParams).then(client => {
        users = client.db('DataBase').collection('users')
        return true
    })
    .catch(() => {
        return false
    })
}
exports.setup = setup

function registration(data) {
    if(data.name == "" || data.email == "" || data.password == ""){
        throw new Error("Wrong registration")
    }

    const user = {name : data.name, email : data.email, password : data.password}
    return users.insertOne(user)
    .then(result => {
        return result.insertedId
    })
}

exports.registration = registration

function signin(data) {
    if(data.email == "" || data.password == ""){
        throw new Error("wrong user name or password")
    }
    
    return users.findOne({email : data.email, password : data.password})
    .then(result => {
        if(result == null){
            throw new Error("wrong user name or password")
        }
        return result
    })
}

exports.signin = signin

function getAllUsers() {
    return users
        .find()
        .sort( {support : -1} ) // сортирует массив по призаку (1 - по возрастанию, -1 - по убыванию)
        .toArray()
}

exports.getAllUsers = getAllUsers

function getUserByEmail(mail) {
    return users.findOne({email : mail})
    .then(rezult => {
        return rezult
    })
}

exports.getUserByEmail = getUserByEmail

function clearUsers() {
    return users.deleteMany({})
}

exports.clearUsers = clearUsers