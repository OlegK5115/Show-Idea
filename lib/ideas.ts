import * as config from 'config'

import * as neo4j from 'neo4j-driver'
const neo4jUrl : string = 'neo4j://' + config.neo4j.host
const driver = neo4j.driver(neo4jUrl, neo4j.auth.basic(config.neo4j.login, config.neo4j.password))

import * as users from '../lib/users'
import * as support from '../lib/support'

const modeLabel = config.mode[0].toUpperCase() + config.mode.slice(1)


export interface Idea {
    heading : String,
    content : String,
    _id ?: number,
    support ?: number
}

interface Result {
    status : Boolean,
    message ?: String,
    support ?: number
}


export function setup() : Promise<Boolean> {
    const session = driver.session()
    return Promise.resolve(!!session).then(res => {
        return session.close()
        .then(() => {
            return !!res
        })
    })
}

export function getLength() : Promise<number> {
    const session = driver.session()
    return session.run("match(i:Idea:" + modeLabel + ") return i")
    .then(resIdeas => {
        return session.close()
        .then(() => {
            return resIdeas.records.length
        })
    })
}

type ResultWithID = Result & {
    ideaId : number
}

export function saveIdea(newIdea, email) : Promise<ResultWithID> | Promise<Result> {
    let result : ResultWithID = {
        status : true,
        ideaId : null
    }
    if(!email){
        result.status = false
        result.message = "Wrong email"
        return Promise.resolve(result).then(() => {
            return result
        })
    }
    if (!(!!newIdea.heading && !!newIdea.content)){
        result.message = "Wrong Idea"
        result.status = false
        return Promise.resolve(result).then(() => {
            return result
        }) 
    }
    const session = driver.session()
    return users.getUserByEmail(email).then(user => {
        if(user == null) {
            result.message = "Wrong email"
            result.status = false
            return result
        }
        const authorId = user._id
        const idea = "{heading : \"" + newIdea.heading + "\", content : \"" + newIdea.content + "\"}"
        return session.run("match(u:User:" + modeLabel + ") where id(u) = " + authorId + "\n"+
        "create (i:Idea:" + modeLabel + idea + ")\n"+
        "create(u)-[:CREATE]->(i) return i")
        .then(resIdea => {
            result.message = "Added Idea"
            result.status = true
            result.ideaId = resIdea.records[0].get(0).identity.low
            return session.close()
            .then(() => {
                return result
            })
        })
    })
}

export function getAllIdeas() {
    const session = driver.session()
    return session.run("match (i:" + modeLabel + ":Idea) return i")
    .then(result => {
        const ideas = []

        result.records.forEach(record => {
            ideas.push(record.get(0).properties)
            const id = record.get(0).identity.low
            ideas[ideas.length-1]._id = id
        })

        return Promise.all(ideas.map((idea) => {
            return support.getSupport(idea._id)
            .then(sup => {
                idea.support = sup
                return session.close()
                .then(() => {
                    return idea
                })
            })
        }))
    })
    .then(ideas => {
        return ideas.sort((idea1, idea2) => {
            if(idea1.support > idea2.support){
                return -1
            }
            else if(idea1.support < idea2.support){
                return 1
            }
            return 0
        })
    })
}

type ResultWithIdea = Result & {
    idea : Idea
}

export function showIdea(id) : Promise<ResultWithIdea> {
    let result : ResultWithIdea = {
        status : true,
        idea : null
    }
    if(isNaN(Number(id))){
        result.status = false
        return Promise.resolve(result).then(res => {
            return res
        })
    }
    else{
        const session = driver.session()
        return session.run("match (i:Idea:" + modeLabel + ") where id(i) = " + Number(id) + " return i")
        .then(resIdea => {
            return session.close()
            .then(() => {
                if(resIdea.records.length == 0){
                    result.status = false
                    return result
                }
                else{
                    result.idea = resIdea.records[0].get(0).properties
                    result.idea._id = resIdea.records[0].get(0).identity.low
                    return result
                }
            })
        })
    }
}

export function clearIdeas() {
    const session = driver.session()
    return session.run("match (i:Idea:" + modeLabel + ") detach delete i")
    .then(res => {
        session.close()
        .then(() => {
            return res
        })
    })
}
