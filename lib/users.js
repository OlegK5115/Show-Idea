const mongodb = require("mongodb")
const mongoUrl = "mongodb://localhost:27017/"
const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true }

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
    if(!(!!data && !!data.name && !!data.email && !!data.password)){
        rezult.status = false
        rezult.message = "Wrong name or password"
        return Promise.resolve(rezult).then(() => {
            return rezult
        })
    }
    
    return addUser(data)
}

exports.registration = registration

function addUser(data) {
    const rezult = {}
    return users.findOne({ email: data.email })
        .then(userCheck => {
            if (userCheck) {
                rezult.status = false
                rezult.message = "There is already user with the same mail"
                return rezult
            }
            const user = { name: data.name, email: data.email, password: data.password, suppIdeas: [], unsuppIdeas: [] }
            return users.insertOne(user)
                .then(result => {
                    rezult.status = true
                    rezult.message = "User registration"
                    rezult.userid = result.insertedId
                    return rezult
                })
        })
}

exports.addUser = addUser

function signin(data) {
    const rezult = {}
    if(data.email == "" || data.password == ""){
        rezult.status = false
        rezult.message = "Wrong email or password"
    }
    
    return users.findOne({email : data.email, password : data.password})
    .then(result => {
        if(!result){
            rezult.status = false
            rezult.message = "Can't find user"
        }
        else{
            rezult.status = true
            rezult.user = result
            rezult.message = "Signin is successful"
        }
        return rezult
    })
}

exports.signin = signin

function findIdeasSupport(mail, ideaid) {
    return users.findOne({email : mail,
        suppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    })
    .then(rezult => {
        return !!rezult
    })
}

exports.findIdeasSupport = findIdeasSupport

function findIdeasUnsupport(mail, ideaid) {
    return users.findOne({email : mail,
        unsuppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    })
    .then(rezult => {
        return !!rezult // преобразование в логическое значение
    })
}

exports.findIdeasUnsupport = findIdeasUnsupport

function pushSupport(mail, ideaid){
    return users.findOneAndUpdate(
        {email : mail},
        {$push : {suppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

exports.pushSupport = pushSupport

function pushUnsupport(mail, ideaid){
    return users.findOneAndUpdate(
        {email : mail},
        {$push : {unsuppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

exports.pushUnsupport = pushUnsupport

function pullSupport(mail, ideaid){
    return users.findOneAndUpdate(
        {email : mail},
        {$pull : {suppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

exports.pullSupport = pullSupport

function pullUnsupport(mail, ideaid){
    return users.findOneAndUpdate(
        {email : mail},
        {$pull : {unsuppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

exports.pullUnsupport = pullUnsupport

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
