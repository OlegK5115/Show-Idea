import * as mongodb from 'mongodb'

import * as connect from '../lib/connect'

export interface User {
    name : String,
    email : String,
    password : String,
    suppIdeas ?: Array<mongodb.ObjectId>,
    unsuppIdeas ?: Array<mongodb.ObjectId>,
    _id ?: mongodb.ObjectId
}

export interface Result {
    status : Boolean,
    message : String,
}

export type ResultWithID = Result & {
    userid : mongodb.ObjectId
}

export type ResultWithUser = Result & {
    user : User
}

let users : mongodb.Collection<User>


export async function setup() : Promise<Boolean> {
    const db = await connect.setup()
    users = db.collection('users')
    return true
}

export async function registration(data) : Promise<ResultWithID> {
    let result : ResultWithID = {
        status : true,
        message : "",
        userid : null
    }

    if(!(!!data && !!data.name && !!data.email && !!data.password)){
        result.status = false
        result.message = "Wrong name or password"
        return result
    }
    
    return addUser(data)
}

export async function addUser(data) : Promise<ResultWithID> {
    let rezult : ResultWithID = {
        status : true,
        message : "",
        userid : null
    }
    const userCheck = await users.findOne({ email: data.email })
    if (userCheck) {
        rezult.status = false
        rezult.message = "There is already user with the same mail"
        return rezult
    }
    const user = { name: data.name, email: data.email, password: data.password, suppIdeas: [], unsuppIdeas: [] }
    const result = await users.insertOne(user)
    rezult.status = true
    rezult.message = "User registration"
    rezult.userid = result.insertedId
    return rezult
}

export async function signin(data) : Promise<ResultWithUser> {
    let rezult : ResultWithUser = {
        status : true,
        message : "",
        user : null
    }

    if(data.email == "" || data.password == ""){
        rezult.status = false
        rezult.message = "Wrong email or password"
    }
    
    const user = await users.findOne({email : data.email, password : data.password})
    if(!user){
        rezult.status = false
        rezult.message = "Can't find user"
    }
    else{
        rezult.status = true
        rezult.message = "Signin is successful"
        rezult.user = user
    }
    return rezult
}

export async function findIdeasSupport(mail, ideaid) : Promise<Boolean> {
    const result = await users.findOne({email : mail,
        suppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    })
    return !!result
}

export async function findIdeasUnsupport(mail, ideaid) : Promise<Boolean> {
    const result = await users.findOne({email : mail,
        unsuppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    })
    return !!result
}

export async function pushSupport(mail, ideaid) : Promise<Boolean> {
    const result = await users.findOneAndUpdate(
        {email : mail},
        {$push : {suppIdeas : new mongodb.ObjectId(ideaid)}
    })
    return !!result
}

export async function pushUnsupport(mail, ideaid) : Promise<Boolean> {
    const result = await users.findOneAndUpdate(
        {email : mail},
        {$push : {unsuppIdeas : new mongodb.ObjectId(ideaid)}
    })
    return !!result
}

export async function pullSupport(mail, ideaid) : Promise<Boolean> {
    const result = await users.findOneAndUpdate(
        {email : mail},
        {$pull : {suppIdeas : new mongodb.ObjectId(ideaid)}
    })
    return !!result
}

export async function pullUnsupport(mail, ideaid) : Promise<Boolean> {
    const result = await users.findOneAndUpdate(
        {email : mail},
        {$pull : {unsuppIdeas : new mongodb.ObjectId(ideaid)}
    })
    return !!result
}

export function getAllUsers() : Promise<User[]> {
    return users
        .find()
        .sort( {support : -1} )
        .toArray()
}

export function getUserByEmail(mail) : Promise<User> {
    return users.findOne({email : mail})
}

export function clearUsers() {
    return users.deleteMany({})
}
