const should = require('should')
const ideas = require('../../lib/ideas')
const users = require('../../lib/users')

// запуск тестов через npm test

describe('Ideas', function() {
    before(function() {
      // очистка базы данных
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

    context('There is no Ideas', function() {
        it('Getting list of Ideas without parameters', function() {
          return ideas.getAllIdeas()
            .then(ideas => {
              ideas.should.be.an.instanceOf(Array).and.have.lengthOf(0)
            })
        })
        // getideas с правильными параметрами
    })

    context('There is one Idea', function() {
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
        return users.registration(user)
        .then((rezult) => {
          user.id = rezult.id
          return ideas.saveIdea(idea, user.email)
          .then(rezult => {
            idea.id = rezult.id
          })
        })
      })

      it('Getting list of Ideas', function(){
        return ideas.getAllIdeas()
          .then(ideas => {
            ideas.should.be.an.instanceOf(Array).and.have.lengthOf(1)
            ideas[0].should.have.property("_id", idea.id)
            ideas[0].should.have.property("heading", idea.heading)
            ideas[0].should.have.property("content", idea.content)
          })
      })
      // test для SaveIdea

      after(function() {
        return ideas.clearIdeas()
        .then(() => {
          return users.clearUsers()
        })
      })
    })

    context('There are two Ideas', function() {
      const user = {
        name : "Alex",
        email : "alexf1989@example.com",
        password : "Pitbuli32"
      }

      const idea1 = {
        "heading": "test",
        "content": "This is my first idea"
      }
      const idea2 = {
        "heading": "second test",
        "content": "This is my second idea"
      }
      before(function() {
        return users.registration(user)
        .then((rezult) => {
          user.id = rezult.id
          return ideas.saveIdea(idea1, user.email)
          .then(resOfIdea1 => {
            idea1.id = resOfIdea1.id
            return ideas.saveIdea(idea2, user.email)
            .then(resOfIdea2 => {
              idea2.id = resOfIdea2.id
            })
          })
        })
      })

      
      it('Support idea', function() {
        return ideas.ideaUp(user.email, idea1.id)
        .then(result => {
          result.status.should.be.equal(true)
          result.support.should.be.equal(1)
        })
        //  Тест Up идеи (повысить поддержку)
      })

      it('Support idea again', function() {
        return ideas.ideaUp(user.email, idea1.id)
        .then(result => {
          result.status.should.be.equal(true)
          result.support.should.be.equal(0)
        })
        //  Тест Up идеи (снять поддержку)
      })

      it('Flip up idea support', function() {
        return ideas.ideaDown(user.email, idea1.id)
        .then(() => {
          return ideas.ideaUp(user.email, idea1.id)
          .then(result => {
            result.status.should.be.equal(true)
            result.support.should.be.equal(1)
          })
        })
        //  Тест Up идеи (сменить поддержку)
      })
      
      it('Unsupport idea', function() {
        return ideas.ideaDown(user.email, idea1.id)
        .then(result => {
          result.status.should.be.equal(true)
          result.support.should.be.equal(-1)
        })
        // Тест Down идеи (понизить поддержку)
      })
      
      it('Unsupport idea again', function() {
        return ideas.ideaDown(user.email, idea1.id)
        .then(result => {
          result.status.should.be.equal(true)
          result.support.should.be.equal(0)
        })
        //  Тест Down идеи (снять поддержку)
      })

      it('Flip down idea support', function() {
        return ideas.ideaUp(user.email, idea1.id)
        .then(() => {
          return ideas.ideaDown(user.email, idea1.id)
          .then(result => {
            result.status.should.be.equal(true)
            result.support.should.be.equal(-1)
          })
        })
        //  Тест Up идеи (сменить поддержку)
      })

      after(function() {
        return ideas.clearIdeas()
        .then(() => {
          users.clearUsers()
        })
      })
    })
})