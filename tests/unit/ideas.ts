import * as MongoDBNamespace from 'mongodb'
const should = require('should')
import * as ideas from '../../lib/ideas'
import * as users from '../../lib/users'

// запуск тестов через npm test

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
                            user.id = rezult.id
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

        it('Adding idea with wrong user email (failure)', function() {
            return ideas.saveIdea(idea, "wrong@example.com")
            .then(rezult => {
                rezult.should.have.property("status")
                rezult.status.should.be.equal(false)
                rezult.should.have.property("message")
            })
        })

        it('Adding idea without user email (failure)', function() {
            return ideas.saveIdea(idea, null)
            .then(rezult => {
                rezult.should.have.property("status")
                rezult.status.should.be.equal(false)
                rezult.should.have.property("message")
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

        it('Getting idea by wrong id', function() {
            return ideas.showIdea('aaaaaaaaaaaaaaaaaaaaaaaa')
            .then(rezult => {
                rezult.should.have.property("status")
                rezult.status.should.be.equal(false)
            })
        })

        it('Getting length of ideas', function() {
            return ideas.getLength()
            .then(length => {
                length.should.be.equal(1)
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
