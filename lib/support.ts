import * as mongodb from 'mongodb'

import * as connect from '../lib/connect'
import * as ideas from '../lib/ideas'
import * as users from '../lib/users'


export interface Support {
    userid : mongodb.ObjectId,
    ideaid : mongodb.ObjectId,
    value : number
}

export type IdeaWithSupport = ideas.Idea & {
    support : number
}

let support : mongodb.Collection<Support>

export async function setup() : Promise<Boolean> {
    const db = await connect.setup()
    support = db.collection('support')
    return true
}

export async function deleteAllUserSupport(userid) {
    const checkUserID = await users.getUserByID(userid)

    if(!checkUserID) {
        throw new Error("User not found")
    }

    await support.deleteMany({userid})
}

export async function deleteAllIdeaSupport(ideaid) {
    const checkIdeaID = await ideas.getIdeaByID(ideaid)

    if(!checkIdeaID) {
        throw new Error("Idea not found")
    }

    await support.deleteMany({ideaid})
}

export async function getSupportForIdea(ideaid) {
    const checkIdeaID = await ideas.getIdeaByID(ideaid)

    if(!checkIdeaID) {
        throw new Error("Idea not found")
    }

    const positiveSupp = await support.countDocuments( { ideaid, value : 1 } )
    const negativeSupp = await support.countDocuments( { ideaid, value : -1 } )

    return positiveSupp - negativeSupp
}


export async function setSupport(userid, ideaid, value) : Promise<boolean> {
    if(typeof(ideaid) == 'string'){
        ideaid = new mongodb.ObjectId(ideaid)
    }

    const checkUserID = await users.getUserByID(userid)
    const checkIdeaID = await ideas.getIdeaByID(ideaid)
    
    if(!checkUserID) {
        throw new Error("User not found")
    }
    if(!checkIdeaID) {
        throw new Error("Idea not found")
    }
    if (typeof(value) != 'number') {
        throw new Error("Wrong support value")
    }

    const supportObject = await support.findOne( { userid, ideaid } )

    if (!supportObject) {
        await support.insertOne({ userid, ideaid, value })
    }
    else if (value != supportObject.value) {
        await support.findOneAndUpdate( { ideaid, userid }, { $set : { value } } )
    }
    else if (value == supportObject.value) {
        await support.deleteOne( { _id : supportObject._id } )
    }
    else {
        throw new Error("Unexpected support combination")
    }

    return true
}

export async function sortIdeasBySupport(ideas : Array<ideas.Idea>) : Promise<Array<IdeaWithSupport>> {
    const ideasWithSupport : Array<IdeaWithSupport> = await Promise.all(
        ideas.map(async (idea) => {
            let ideaWithSupport : IdeaWithSupport = idea as IdeaWithSupport
            ideaWithSupport.support = await getSupportForIdea(idea._id)
            return ideaWithSupport
        })
    )

    ideasWithSupport.sort((idea1, idea2) => {
        return idea2.support - idea1.support
    })

    return ideasWithSupport
}
