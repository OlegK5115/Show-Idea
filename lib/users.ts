import * as bcrypt from 'bcryptjs'
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

let users : mongodb.Collection<User>


export async function setup() : Promise<Boolean> {
    const db = await connect.setup()
    users = db.collection('users')
    return true
}

export async function registration(data) : Promise<mongodb.ObjectId> {
    if (!data) {
        throw new Error("Missing data")
    }
    else if (!data.name) {
        throw new Error("Missing name")
    }
    else if (!data.email) {
        throw new Error("Missing email")
    }
    else if (!data.password) {
        throw new Error("Missing password")
    }
    return addUser(data)
}

export async function addUser(data) : Promise<mongodb.ObjectId> {
    const userCheck = await users.findOne({ email: data.email })

    if (userCheck) {
        throw new Error("This user is already registered")
    }

    const user = {
        name: data.name,
        email: data.email,
        password: await genHash(data.password),
        suppIdeas: [],
        unsuppIdeas: []
    }

    return (await users.insertOne(user)).insertedId
}

async function genHash(password) {
    const salt = await bcrypt.genSalt(5)
    return await bcrypt.hash(password, salt)
}

export async function signin(data) : Promise<User> {
    if(!data.email) {
        throw new Error("Missing email")
    }
    else if(!data.password){
        throw new Error("Missing password")
    }
    
    const user = await users.findOne({
        email : data.email
    })
    if(user){
        if(!(await bcrypt.compare(data.password, user.password))){
            throw new Error("Wrong Password")
        }
        delete user.password
    }

    return user
}

export async function findIdeasSupport(mail, ideaid) : Promise<Boolean> {
    return !!(await users.findOne({
        email : mail,
        suppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    }))
}

export async function findIdeasUnsupport(mail, ideaid) : Promise<Boolean> {
    return !!(await users.findOne({
        email : mail,
        unsuppIdeas : {$all : [new mongodb.ObjectId(ideaid)]}
    }))
}

export async function pushSupport(mail, ideaid) : Promise<Boolean> {
    return !!(await users.findOneAndUpdate(
        {email : mail},
        {$push : {suppIdeas : new mongodb.ObjectId(ideaid)}
    }))
}

export async function pushUnsupport(mail, ideaid) : Promise<Boolean> {
    return !!(await users.findOneAndUpdate(
        {email : mail},
        {$push : {unsuppIdeas : new mongodb.ObjectId(ideaid)}
    }))
}

export async function pullSupport(mail, ideaid) : Promise<Boolean> {
    return !!(await users.findOneAndUpdate(
        {email : mail},
        {$pull : {suppIdeas : new mongodb.ObjectId(ideaid)}
    }))
}

export async function pullUnsupport(mail, ideaid) : Promise<Boolean> {
    return !!(await users.findOneAndUpdate(
        {email : mail},
        {$pull : {unsuppIdeas : new mongodb.ObjectId(ideaid)}
    }))
}

export function getAllUsers() : Promise<User[]> {
    return users
        .find()
        .sort( {support : -1} )
        .toArray()
}

export async function getUserByEmail(mail) : Promise<User> {
    if(!mail){
        throw new Error("Missing email")
    }

    const user = await users.findOne({
        email : mail
    })
    if(user){
        delete user.password
    }

    return user
}

export function clearUsers() {
    return users.deleteMany({})
}
