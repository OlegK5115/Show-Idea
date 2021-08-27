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
        .then(() => {
          return ideas.saveIdea(idea, user.email)
          .then((id) => {
            idea.id = id
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
        "heading": "test",
        "content": "This is my first idea"
      }
      let id1, id2
      before(function() {
        return users.registration(user)
        .then(() => {
          return ideas.saveIdea(idea1, user.email)
          .then(id => {
            id1 = id
            return ideas.saveIdea(idea2, user.email)
            .then(id => {
              id2 = id
            })
          })
        })
      })

      it('Support idea', function() {
        return ideas.ideaUp(id2)
        .then(supp => {
          supp.should.equal(1)
        })
        // Тест Up с одной идеей
      })

      it('Unsupport idea', function() {
        return ideas.ideaDown(id1)
        .then(supp => {
          supp.should.equal(-1)
        })
      })
      // Тест down с одной идеей
      after(function() {
        return ideas.clearIdeas()
      })
    })
})