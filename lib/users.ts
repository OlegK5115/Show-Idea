import * as mongodb from 'mongodb'

const mongoUrl = "mongodb://localhost:27017/"

export interface User {
    name : String,
    email : String,
    password : String,
    suppIdeas ?: Array<number>,
    unsuppIdeas ?: Array<number>,
    id ?: mongodb.ObjectId
}

interface Result {
    status : Boolean,
    message : String,
}


let users : mongodb.Collection<mongodb.Document>

export function setup() : Promise<Boolean> {
    // проверять режим базы данных testing

    // !!!

    return mongodb.MongoClient.connect(mongoUrl).then(client => {
        users = client.db('DataBase').collection('users')
        return true
    })
    .catch(() => {
        return false
    })
}

export function registration(data) : Promise<Result> {
    let rezult : Result = {
        status : true,
        message : ""
    }
    if(!(!!data && !!data.name && !!data.email && !!data.password)){
        rezult.status = false
        rezult.message = "Wrong name or password"
        return Promise.resolve(rezult).then(() => {
            return rezult
        })
    }
    
    return addUser(data)
}

export type ResultWithID = Result & {
    userid : mongodb.ObjectId
}

export function addUser(data) : Promise<ResultWithID> {
    let rezult : ResultWithID = {
        status : true,
        message : "",
        userid : null
    }
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

export type ResultWithUser = Result & {
    user : User
}

export function signin(data) : Promise<ResultWithUser> {
    let rezult : ResultWithUser = {
        status : true,
        message : "",
        user : null
    }
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
            rezult.user.email = result.email
            rezult.user.id = result._id
            rezult.user.name = result.name
            rezult.user.password = result.password
            rezult.user.suppIdeas = result.suppIdeas
            rezult.user.unsuppIdeas = result.unsuppIdeas
            rezult.message = "Signin is successful"
        }
        return rezult
    })
}

export function findIdeasSupport(mail, ideaid) : Promise<Boolean> {
    return users.findOne({email : mail,
        suppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    })
    .then(rezult => {
        return !!rezult
    })
}

export function findIdeasUnsupport(mail, ideaid) : Promise<Boolean> {
    return users.findOne({email : mail,
        unsuppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    })
    .then(rezult => {
        return !!rezult // преобразование в логическое значение
    })
}

export function pushSupport(mail, ideaid) : Promise<Boolean> {
    return users.findOneAndUpdate(
        {email : mail},
        {$push : {suppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

export function pushUnsupport(mail, ideaid) : Promise<Boolean> {
    return users.findOneAndUpdate(
        {email : mail},
        {$push : {unsuppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

export function pullSupport(mail, ideaid) : Promise<Boolean> {
    return users.findOneAndUpdate(
        {email : mail},
        {$pull : {suppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

export function pullUnsupport(mail, ideaid) : Promise<Boolean> {
    return users.findOneAndUpdate(
        {email : mail},
        {$pull : {unsuppIdeas : new mongodb.ObjectId(ideaid)}})
        .then(rezult => {
            return true
        })
}

export function getAllUsers() : Promise<User[]> {
    return users
        .find()
        .sort( {support : -1} ) // сортирует массив по призаку (1 - по возрастанию, -1 - по убыванию)
        .toArray()
}

export function getUserByEmail(mail) : Promise<User> {
    return users.findOne({email : mail})
    .then(result => {
        let user : User = {
            id : result._id,
            email : result.email,
            name : result.name,
            password : result.password,
            suppIdeas : result.suppIdeas,
            unsuppIdeas : result.unsuppIdeas
        }
        return user
    })
}

export function clearUsers() {
    return users.deleteMany({})
}
