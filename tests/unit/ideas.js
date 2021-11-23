const should = require('should')
const ideas = require('../../lib/ideas')
const users = require('../../lib/users')

// запуск тестов через npm test

describe('Ideas', function(){

    const user = {
        name : "Alex",
        email : "alexf1989@example.com",
        password : "Pitbuli32"
    } 

    const idea = {
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
                            user.id = rezult.id
                        })
                    })
                })
            })
        })
    })
    
    context('There is no Ideas', function() {

        it('Getting empty list of Ideas', function() {
            return ideas.getAllIdeas()
            .then(ideas => {
                ideas.should.be.an.instanceOf(Array).and.have.lengthOf(0)
            })
        })

        it('Adding first idea', function() {
            return ideas.saveIdea(idea, user.email)
            .then(rezult => {
                rezult.should.have.property("status")
                rezult.status.should.be.equal(true)
                rezult.should.have.property("message")
                rezult.should.have.property("id")
                idea.id = rezult.id
            })
        })

        it('Getting idea by id', function() {
            return ideas.showIdea(idea.id)
            .then(rezult => {
                rezult.should.have.property("status")
                rezult.status.should.be.equal(true)
                rezult.should.have.property("heading")
                rezult.heading.should.be.equal(idea.heading)
                rezult.should.have.property("content")
                rezult.content.should.be.equal(idea.content)
                rezult.should.have.property("id")
                rezult.id.should.be.equal(idea.id)
            })
        })

        after(function() {
            return ideas.clearIdeas()
        })

    })

    // saveIdea, showIdea, getLenght

    context('There is one Idea', function() {
        

        before(function() {
            return ideas.saveIdea(idea, user.email)
            .then(rezult => {
                idea.id = rezult.id
            })
        })

        it('Getting list of one Idea', function(){
            return ideas.getAllIdeas()
            .then(ideas => {
                ideas.should.be.an.instanceOf(Array).and.have.lengthOf(1)
                ideas[0].should.have.property("_id", idea.id)
                ideas[0].should.have.property("heading", idea.heading)
                ideas[0].should.have.property("content", idea.content)
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
