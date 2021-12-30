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

    before(function() {
        return ideas.setup()
        .then(() => {
            return users.setup()
            .then(() => {
                return ideas.clearIdeas()
                .then(() => {
                    return users.clearUsers()
                })
            })
        })
    })

    context('There are two Ideas', function() {
        
        before(function() {
                return users.registration(user)
                .then((rezult) => {
                    user._id = rezult.id
                    return ideas.saveIdea(idea1, user.email)
                    .then(resOfIdea1 => {
                        idea1._id = resOfIdea1.ideaId
                        return ideas.saveIdea(idea2, user.email)
                        .then(resOfIdea2 => {
                        idea2._id = resOfIdea2.ideaId
                        })
                    })
                })
            })
        
        
        it('Support idea', function() {
            return ideas.ideaUp(user.email, idea1._id)
            .then(result => {
                should(result.status).be.equal(true)
                should(result.support).be.equal(1)
            })
            //  Тест Up идеи (повысить поддержку)
        })
    
        it('Support idea again', function() {
            return ideas.ideaUp(user.email, idea1._id)
            .then(result => {
                should(result.status).be.equal(true)
                should(result.support).be.equal(0)
            })
            //  Тест Up идеи (снять поддержку)
        })
    
        it('Flip up idea support', function() {
            return ideas.ideaDown(user.email, idea1._id)
            .then(() => {
                return ideas.ideaUp(user.email, idea1._id)
                .then(result => {
                    should(result.status).be.equal(true)
                    should(result.support).be.equal(1)
                })
            })
            //  Тест Up идеи (сменить поддержку)
        })
        
        it('Unsupport idea', function() {
            return ideas.ideaDown(user.email, idea1._id)
            .then(result => {
                should(result.status).be.equal(true)
                should(result.support).be.equal(-1)
            })
            // Тест Down идеи (понизить поддержку)
        })
        
        it('Unsupport idea again', function() {
            return ideas.ideaDown(user.email, idea1._id)
            .then(result => {
                should(result.status).be.equal(true)
                should(result.support).be.equal(0)
            })
            //  Тест Down идеи (снять поддержку)
        })
    
        it('Flip down idea support', function() {
            return ideas.ideaUp(user.email, idea1._id)
            .then(() => {
                return ideas.ideaDown(user.email, idea1._id)
                .then(result => {
                    should(result.status).be.equal(true)
                    should(result.support).be.equal(-1)
                })
            })
            //  Тест Up идеи (сменить поддержку)
        })
    
        it('Getting list of Ideas', function(){
            return ideas.getAllIdeas()
            .then(ideas => {
                should(ideas).be.an.instanceOf(Array).and.have.lengthOf(2)
                should(ideas[0]).have.property("_id", idea2._id)
                should(ideas[0]).have.property("heading", idea2.heading)
                should(ideas[0]).have.property("content", idea2.content)
                should(ideas[0]).have.property("support", 0)
                should(ideas[1]).have.property("_id", idea1._id)
                should(ideas[1]).have.property("heading", idea1.heading)
                should(ideas[1]).have.property("content", idea1.content)
                should(ideas[1]).have.property("support", -1)
            })
        })
    
        after(function() {
            return ideas.clearIdeas()
            .then(() => {
                users.clearUsers()
            })
        })
    })
})
