import * as bcrypt from 'bcryptjs'
import * as mongodb from 'mongodb'

import * as connect from '../lib/connect'

export interface User {
    name : String,
    email : String,
    password : String,
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
        password: await genHash(data.password)
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

export function getAllUsers() : Promise<User[]> {
    return users
        .find()
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

export async function getUserByID(id : string) : Promise<User> {
    if(!id){
        throw new Error("Missing id")
    }

    const user = await users.findOne({
        _id : new mongodb.ObjectId(id)
    })

    if(user){
        delete user.password
    }
    
    return user
}

export function clearUsers() {
    return users.deleteMany({})
}
