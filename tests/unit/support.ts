const should = require('should')
import * as ideas from '../../lib/ideas'
import * as users from '../../lib/users'

describe('Support', function() {
    const user : users.User = {
        name : "Alex",
        email : "alexf1989@example.com",
        password : "Pitbuli32"
    }

    const idea1 : ideas.Idea = {
        "heading": "test",
        "content": "This is my first idea"
    }
    const idea2 : ideas.Idea = {
        "heading": "second test",
        "content": "This is my second idea"
    }

    before(async function() {
        await ideas.setup()
        await users.setup()
        await ideas.clearIdeas()
        await users.clearUsers()
        return
    })

    context('There are two Ideas', function() {
        
        before(async function() {
            user._id = await users.registration(user)
            idea1._id = await ideas.saveIdea(idea1, user.email)
            idea2._id = await ideas.saveIdea(idea2, user.email)
        })
        
        
        it('Support idea', async function() {
            const support = await ideas.ideaUp(user.email, idea1._id)
            should(support).be.equal(1)
        })
    
        it('Support idea again', async function() {
            const support = await ideas.ideaUp(user.email, idea1._id)
            should(support).be.equal(0)
        })
    
        it('Flip up idea support', async function() {
            await ideas.ideaDown(user.email, idea1._id)
            const support = await ideas.ideaUp(user.email, idea1._id)
            should(support).be.equal(1)
        })
        
        it('Unsupport idea', async function() {
            const support = await ideas.ideaDown(user.email, idea1._id)
            should(support).be.equal(-1)
        })
        
        it('Unsupport idea again', async function() {
            const support = await ideas.ideaDown(user.email, idea1._id)
            should(support).be.equal(0)
        })
    
        it('Flip down idea support', async function() {
            await ideas.ideaUp(user.email, idea1._id)
            const support = await ideas.ideaDown(user.email, idea1._id)
            should(support).be.equal(-1)
        })
    
        it('Getting list of Ideas', async function(){
            const allIdeas = await ideas.getAllIdeas()
            should(allIdeas).be.an.instanceOf(Array).and.have.lengthOf(2)
            should(allIdeas[0]).have.property("_id", idea2._id)
            should(allIdeas[0]).have.property("heading", idea2.heading)
            should(allIdeas[0]).have.property("content", idea2.content)
            should(allIdeas[0]).have.property("support", 0)
            should(allIdeas[1]).have.property("_id", idea1._id)
            should(allIdeas[1]).have.property("heading", idea1.heading)
            should(allIdeas[1]).have.property("content", idea1.content)
            should(allIdeas[1]).have.property("support", -1)
        })
    
        after(async function() {
            await ideas.clearIdeas()
            await users.clearUsers()
        })
    })
})
