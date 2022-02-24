import * as config from 'config'

import * as neo4j from 'neo4j-driver'
const neo4jUrl = 'neo4j://' + config.neo4j.host
const driver = neo4j.driver(neo4jUrl, neo4j.auth.basic(config.neo4j.login, config.neo4j.password))

const modeLabel = config.mode[0].toUpperCase() + config.mode.slice(1)

export interface User {
    name : String,
    email : String,
    password : String,
    _id ?: number
}

interface Result {
    status : Boolean,
    message : String,
}


export function setup() : Promise<Boolean> {
    const session = driver.session()
    return Promise.resolve(!!session).then(res => {
        return session.close()
        .then(() => {
            return res
        })
    })
}

export type ResultWithID = Result & {
    userid : number
}

export function registration(data) : Promise<ResultWithID> {
    let rezult : ResultWithID = {
        status : true,
        message : "",
        userid : null
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

export function addUser(data) : Promise<ResultWithID> {
    const session = driver.session()
    let rezult : ResultWithID = {
        status : true,
        message : "",
        userid : null
    }
    return session.run("match (u:User:" + modeLabel+ "{email : \"" + data.email + "\"}) return u")
    .then(resUsers => {
        if (resUsers.records.length > 0) {
            rezult.status = false
            rezult.message = "There is already user with the same mail"
            return rezult
        }
        const user = "{name : \"" + data.name + "\", email : \"" + data.email + "\", password : \"" + data.password + "\"}"
        return session.run("create (u:User:" + modeLabel + user + ") return u")
        .then(resUser => {
            rezult.status = true
            rezult.message = "User registration"
            rezult.userid = resUser.records[0].get(0).identity.low
            return session.close()
            .then(() => {
                return rezult
            })
        })
    })
}

export type ResultWithUser = Result & {
    user : User
}

export function signin(data) : Promise<ResultWithUser> {
    const session = driver.session()
    let result : ResultWithUser = {
        status : true,
        message : "",
        user : null
    }

    if(data.email == "" || data.password == ""){
        result.status = false
        result.message = "Wrong email or password"
    }
    const dataUser = "{email : \"" + data.email + "\", password : \"" + data.password + "\"}"
    return session.run("match (u:User:" + modeLabel + dataUser + ") return u")
    .then(resUser => {
        if(resUser.records.length == 0){
            result.status = false
            result.message = "Can't find user"
        }
        else{
            result.status = true
            result.message = "Signin is successful"
            result.user = resUser.records[0].get(0).properties
        }
        return session.close()
        .then(() => {
            return result
        })
    })
}

export function getAllUsers() : Promise<User[]> {
    const session = driver.session()
    return session.run("match (u:User:" + modeLabel + ") return u")
    .then(resUsers => {
        let users = []
        resUsers.records.forEach(record => {
            users.push(record.get(0).properties)
            users[users.length-1]._id = record.get(0).identity.low
        })
        return session.close()
        .then(() => {
            return users
        })
    })
}

export function getUserByEmail(mail) : Promise<User> {
    const session = driver.session()
    return session.run("match (u:User:" + modeLabel +"{email:\"" + mail + "\"}) return u")
    .then(resUser => {
        let user = null
        if(resUser.records.length > 0){
            user = resUser.records[0].get(0).properties
            user._id = resUser.records[0].get(0).identity.low
        }
        return session.close()
        .then(() => {
            return user
        })
    })
}

export function clearUsers() {
    const session = driver.session()
    return session.run("match (i:User:" + modeLabel + ") detach delete i")
    .then(res => {
        return session.close()
        .then(() => {
            return res
        })
    })
}
