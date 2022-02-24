import * as config from 'config'

import * as neo4j from 'neo4j-driver'
const neo4jUrl = 'neo4j://' + config.neo4j.host
const driver = neo4j.driver(neo4jUrl, neo4j.auth.basic(config.neo4j.login, config.neo4j.password))

const modeLabel = config.mode[0].toUpperCase() + config.mode.slice(1)

interface Result {
    status : Boolean,
    message : String,
    support : number
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

export function getSupport(ideaid) : Promise<number> {
    const session = driver.session()
    return session.run("match(i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
    "match sup = ()-[:SUPPORT]->(i) \n" +
    "return count(sup)")
    .then((resSupport) => {
        return session.run("match(i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
        "match unsup = ()-[:UNSUPPORT]->(i) \n" +
        "return count(unsup)")
        .then((resUnsupport) => {
            return session.close()
            .then(() => {
                return resSupport.records[0].get(0).low-resUnsupport.records[0].get(0)
            })
        })
    })
}


export function ideaUp(mail, ideaid) : Promise<Result> {
    let result : Result = {
        status : true,
        message : "",
        support : null
    }
    return findIdeasSupport(mail, ideaid)
    .then(bool1 => {
        return findIdeasUnsupport(mail, ideaid)
        .then(bool2 => {
            if(!bool1 && !bool2){
                return pushSupport(mail, ideaid)
                .then(() => {
                    return getSupport(ideaid)
                    .then(support => {
                        result.support = support
                        return result
                    })
                })
            }
            else if(bool2){
                return pullUnsupport(mail, ideaid)
                .then(() => {
                    return pushSupport(mail, ideaid)
                    .then(() => {
                        return getSupport(ideaid)
                        .then(support => {
                            result.support = support
                            return result
                        })
                    })
                })
            }
            else{
                return pullSupport(mail, ideaid)
                .then(() => {
                    return getSupport(ideaid)
                    .then(support => {
                        result.support = support
                        return result
                    })
                })
            }
        })
    })
}

export function ideaDown(mail, ideaid) : Promise<Result> {
    let result : Result = {
        status : true,
        message : "",
        support : null
    }
    return findIdeasSupport(mail, ideaid)
    .then(bool1 => {
        return findIdeasUnsupport(mail, ideaid)
        .then(bool2 => {
            if(!bool1 && !bool2){
                return pushUnsupport(mail, ideaid)
                .then(() => {
                    return getSupport(ideaid)
                    .then(support => {
                        result.support = support
                        return result
                    })
                })
            }
            else if(bool1){
                return pullSupport(mail, ideaid)
                .then(() => {
                    return pushUnsupport(mail, ideaid)
                    .then(() => {
                        return getSupport(ideaid)
                        .then(support => {
                            result.support = support
                            return result
                        })
                    })
                })
            }
            else {
                return pullUnsupport(mail, ideaid)
                .then(() => {
                    return getSupport(ideaid)
                    .then(support => {
                        result.support = support
                        return result
                    })
                })
            }
        })
    })
}


export function findIdeasSupport(mail, ideaid) : Promise<Boolean> {
    const session = driver.session()
    const query  = "match (u:User:" + modeLabel + "{email : \"" + mail + "\"}) \n" +
    "match (i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
    "OPTIONAL match ans = (u)-[:SUPPORT]->(i) return ans is not null"
    return session.run(query)
    .then(res => {
        return session.close()
        .then(() => {
            return res.records[0].get(0)
        })
    })
}

export function findIdeasUnsupport(mail, ideaid) : Promise<Boolean> {
    const session = driver.session()
    const query = "match (u:User:" + modeLabel + "{email : \"" + mail + "\"}) \n" +
    "match (i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
    "OPTIONAL match ans = (u)-[:UNSUPPORT]->(i) return ans is not null"
    return session.run(query)
    .then(res => {
        return session.close()
        .then(() => {
            return res.records[0].get(0)
        })
    })
}

export function pushSupport(mail, ideaid) : Promise<Boolean> {
    const session = driver.session()
    const query = "match (u:User:" + modeLabel + "{email : \"" + mail + "\"})\n" +
    "match (i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
    "create (u)-[:SUPPORT]->(i)"
    return session.run(query)
    .then(res => {
        return session.close()
        .then(() => {
            return !!res
        })
    })
}

export function pushUnsupport(mail, ideaid) : Promise<Boolean> {
    const session = driver.session()
    const query = "match (u:User:" + modeLabel + "{email : \"" + mail + "\"})\n" +
    "match (i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
    "create (u)-[:UNSUPPORT]->(i)"
    return session.run(query)
    .then(res => {
        return session.close()
        .then(() => {
            return !!res
        })
    })
}

export function pullSupport(mail, ideaid) : Promise<Boolean> {
    const session = driver.session()
    const query = "match (u:User:" + modeLabel + "{email : \"" + mail + "\"})\n" +
    "match (i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
    "match (u)-[r:SUPPORT]->(i) \n" +
    "delete r"
    return session.run(query)
    .then(res => {
        return session.close()
        .then(() => {
            return !!res
        })
    })
}

export function pullUnsupport(mail, ideaid) : Promise<Boolean> {
    const session = driver.session()
    const query = "match (u:User:" + modeLabel + "{email : \"" + mail + "\"})\n" +
    "match (i:Idea:" + modeLabel + ") where id(i) = " + ideaid + "\n" +
    "match (u)-[r:UNSUPPORT]->(i) \n" +
    "delete r"
    return session.run(query)
    .then(res => {
        return session.close()
        .then(() => {
            return !!res
        })
    })
}
