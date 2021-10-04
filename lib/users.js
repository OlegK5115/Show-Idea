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
    const rezult = {}
    if(data.name == "" || data.email == "" || data.password == ""){
        rezult.status = false
        rezult.message = "Wrong name or password"
        return Promise.resolve(rezult).then(() => {
            return rezult
        })
    }

    const user = {name : data.name, email : data.email, password : data.password, suppIdeas : [], unsuppIdeas : []}
    return users.insertOne(user)
    .then(result => {
        rezult.status = true
        rezult.message = "User registration"
        rezult.userid = result.insertedId
        return rezult
    })
}

exports.registration = registration

function signin(data) {
    const rezult = {}
    if(data.email == "" || data.password == ""){
        rezult.status = false
        rezult.message = "Wrong email or password"
    }
    
    return users.findOne({email : data.email, password : data.password})
    .then(result => {
        if(result == null){
            rezult.status = false
            rezult.message = "Can't find user"
        }
        else{
            rezult.status = true
            rezult.user = result
        }
        return rezult
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