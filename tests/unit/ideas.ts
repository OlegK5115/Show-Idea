import * as MongoDBNamespace from 'mongodb'
const should = require('should')
import * as ideas from '../../lib/ideas'
import * as users from '../../lib/users'

describe('Ideas', function(){

    const user : users.User = {
        name : "Alex",
        email : "alexf1989@example.com",
        password : "Pitbuli32"
    } 

    const idea : ideas.Idea = {
        "heading": "test",
        "content": "This is my first idea"
    }

    before( async function() {
        await ideas.setup()
        await users.setup()
        await ideas.clearIdeas()
        await users.clearUsers()
        const res = await users.registration(user)
        user._id = res.userid
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
            const result = await ideas.saveIdea(idea, user.email)
            should(result).have.property("status")
            should(result.status).be.equal(true)
            should(result).have.property("message")
            should(result).have.property("ideaId")
            idea._id = result.ideaId
        })

        it('Adding idea with wrong user email (failure)', async function() {
            const result = await ideas.saveIdea(idea, "wrong@example.com")
            should(result).have.property("status")
            should(result.status).be.equal(false)
            should(result).have.property("message")
        })

        it('Adding idea without user email (failure)', async function() {
            const result = await ideas.saveIdea(idea, null)
            should(result).have.property("status")
            should(result.status).be.equal(false)
            should(result).have.property("message")
        })

        it('Getting idea by id', async function() {
            const result = await ideas.showIdea(idea._id.toString())
            should(result).have.property("status")
            should(result.status).be.equal(true)
            should(result).have.property("idea")
            should(result.idea).have.property("heading")
            should(result.idea.heading).be.equal(idea.heading)
            should(result.idea).have.property("content")
            should(result.idea.content).be.equal(idea.content)
            should(result.idea).have.property("_id")
            should(result.idea._id.toString()).be.equal(idea._id.toString())
        })

        it('Getting idea by wrong id', async function() {
            const result = await ideas.showIdea('aaaaaaaaaaaaaaaaaaaaaaaa')
            should(result).have.property("status")
            should(result.status).be.equal(false)
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
            const result = await ideas.saveIdea(idea, user.email)
            idea._id = result.ideaId
        })

        it('Getting list of one Idea', async function(){
            const allIdeas = await ideas.getAllIdeas()
            should(allIdeas).be.an.instanceOf(Array).and.have.lengthOf(1)
            should(allIdeas[0]).have.property("_id")
            should(allIdeas[0]._id.toString()).be.equal(idea._id.toString())
            should(allIdeas[0]).have.property("heading", idea.heading)
            should(allIdeas[0]).have.property("content", idea.content)
        })

        after( async function() {
            return ideas.clearIdeas()
        })
    })

    after( async function() {
        return users.clearUsers()
    })
})
