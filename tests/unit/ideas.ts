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

    before(function() {
        return ideas.setup()
        .then(() => {
            return users.setup()
            .then(() => {
                return ideas.clearIdeas()
                .then(() => {
                    return users.clearUsers()
                    .then(() => {
                        return users.registration(user)
                        .then((rezult) => {
                            user._id = rezult.userid
                        })
                    })
                })
            })
        })
    })
    
    context('There is no Ideas', function() {

        before(function(){
            return users.addUser({name : "Virus", email : null, password : "iamvirus1"})
        })

        it('Getting empty list of Ideas', function() {
            return ideas.getAllIdeas()
            .then(ideas => {
                should(ideas).be.an.instanceOf(Array).and.have.lengthOf(0)
            })
        })

        it('Adding first idea', function() {
            return ideas.saveIdea(idea, user.email)
            .then(rezult => {
                should(rezult).have.property("status")
                should(rezult.status).be.equal(true)
                should(rezult).have.property("message")
                should(rezult).have.property("ideaId")
                idea._id = rezult.ideaId
            })
        })

        it('Adding idea with wrong user email (failure)', function() {
            return ideas.saveIdea(idea, "wrong@example.com")
            .then(rezult => {
                should(rezult).have.property("status")
                should(rezult.status).be.equal(false)
                should(rezult).have.property("message")
            })
        })

        it('Adding idea without user email (failure)', function() {
            return ideas.saveIdea(idea, null)
            .then(rezult => {
                should(rezult).have.property("status")
                should(rezult.status).be.equal(false)
                should(rezult).have.property("message")
            })
        })

        it('Getting idea by id', function() {
            return ideas.showIdea(idea._id.toString())
            .then(rezult => {
                should(rezult).have.property("status")
                should(rezult.status).be.equal(true)
                should(rezult).have.property("idea")
                should(rezult.idea).have.property("heading")
                should(rezult.idea.heading).be.equal(idea.heading)
                should(rezult.idea).have.property("content")
                should(rezult.idea.content).be.equal(idea.content)
                should(rezult.idea).have.property("_id")
                should(rezult.idea._id.toString()).be.equal(idea._id.toString())
            })
        })

        it('Getting idea by wrong id', function() {
            return ideas.showIdea('aaaaaaaaaaaaaaaaaaaaaaaa')
            .then(rezult => {
                should(rezult).have.property("status")
                should(rezult.status).be.equal(false)
            })
        })

        it('Getting length of ideas', function() {
            return ideas.getLength()
            .then(length => {
                should(length).be.equal(1)
            })
        })

        after(function() {
            return ideas.clearIdeas()
        })

    })

    context('There is one Idea', function() {

        before(function() {
            return ideas.saveIdea(idea, user.email)
            .then(rezult => {
                idea._id = rezult.ideaId
            })
        })

        it('Getting list of one Idea', function(){
            return ideas.getAllIdeas()
            .then(ideas => {
                should(ideas).be.an.instanceOf(Array).and.have.lengthOf(1)
                should(ideas[0]).have.property("_id")
                should(ideas[0]._id.toString()).be.equal(idea._id.toString())
                should(ideas[0]).have.property("heading", idea.heading)
                should(ideas[0]).have.property("content", idea.content)
            })
        })

        after(function() {
            return ideas.clearIdeas()
        })
    })

    after(function() {
        return users.clearUsers()
    })
})
