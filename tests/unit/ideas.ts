import * as MongoDBNamespace from 'mongodb'
const should = require('should')
import * as ideas from '../../lib/ideas'
import * as users from '../../lib/users'

describe('Ideas', function(){

    const userData : users.User = {
        name : "Alex",
        email : "alexf1989@example.com",
        password : "Pitbuli32"
    }

    const ideaData : ideas.Idea = {
        "heading": "test",
        "content": "This is my first idea"
    }

    before( async function() {
        await ideas.setup()
        await users.setup()
        await ideas.clearIdeas()
        await users.clearUsers()
        userData._id = await users.registration(userData)
    })
    
    context('There is no Ideas', function() {

        before(function(){
            return users.addUser({
                name : "Virus",
                email : null,
                password : "iamvirus1"
            })
        })

        it('Getting empty list of Ideas', async function() {
            const allIdeas = await ideas.getAllIdeas()
            should(allIdeas).be.an.instanceOf(Array).and.have.lengthOf(0)
        })

        it('Adding first idea', async function() {
            const ideaId = await ideas.saveIdea(ideaData, userData.email)
            should.notEqual(ideaId, null)
            ideaData._id = ideaId
        })

        it('Adding idea with wrong user email (failure)', async function() {
            const ideaId = await ideas.saveIdea(ideaData, "wrong@example.com")
            should(ideaId).be.equal(null)
        })

        it('Adding idea without user email (failure)', async function() {
            try {
                const userid = await ideas.saveIdea(ideaData, null)
                should.fail(userid, null, "Error save idea")
            }
            catch (err) {
                should(err.message).be.equal("Missing email")
            }
        })

        it('Getting idea by id', async function() {
            const idea = await ideas.getIdeaByID(ideaData._id.toString())
            should.notEqual(idea, null)
            should(idea).have.property("heading")
            should(idea.heading).be.equal(ideaData.heading)
            should(idea).have.property("content")
            should(idea.content).be.equal(ideaData.content)
            should(idea).have.property("_id")
            should(idea._id.toString()).be.equal(ideaData._id.toString())
        })

        it('Getting idea by wrong id', async function() {
            const idea = await ideas.getIdeaByID('aaaaaaaaaaaaaaaaaaaaaaaa')
            should(idea).be.equal(null)
        })

        it('Getting length of ideas', async function() {
            const length = await ideas.getLength()
            should(length).be.equal(1)
        })

        after(async function() {
            return ideas.clearIdeas()
        })

    })

    context('There is one Idea', function() {

        before(async function() {
            ideaData._id = await ideas.saveIdea(ideaData, userData.email)
        })

        it('Getting list of one Idea', async function(){
            const allIdeas = await ideas.getAllIdeas()
            should(allIdeas).be.an.instanceOf(Array).and.have.lengthOf(1)
            should(allIdeas[0]).have.property("_id")
            should(allIdeas[0]._id.toString()).be.equal(ideaData._id.toString())
            should(allIdeas[0]).have.property("heading", ideaData.heading)
            should(allIdeas[0]).have.property("content", ideaData.content)
        })

        after( async function() {
            return ideas.clearIdeas()
        })
    })

    after( async function() {
        return users.clearUsers()
    })
})
