const should = require('should')
const lib = require('../../lib')

// запуск тестов через npm test

describe('Ideas', function() {
    before(function() {
      // очистка базы данных
        return lib.setup()
        .then(() => {
          return lib.clearIdeas()
        })
    })

    context('There is no Ideas', function() {
        it('Getting list of Ideas without parameters', function() {
          return lib.getAllIdeas()
            .then(ideas => {
              ideas.should.be.an.instanceOf(Array).and.have.lengthOf(0)
            })
        })
        // getideas с правильными параметрами
    })

    context('There is one Idea', function() {
      const idea = {
        "heading": "test",
        "content": "This is my first idea"
      }

      before(function() {
        return lib.saveIdea(idea)
          .then((id) => {
            idea.id = id
          })
      })

      it('Getting list of Ideas', function(){
        return lib.getAllIdeas()
          .then(ideas => {
            ideas.should.be.an.instanceOf(Array).and.have.lengthOf(1)
            ideas[0].should.have.property("_id", idea.id)
            ideas[0].should.have.property("heading", idea.heading)
            ideas[0].should.have.property("content", idea.content)
          })
      })
      // test для SaveIdea

      after(function() {
        return lib.clearIdeas()
      })
    })

    context('There are two Ideas', function() {
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
        return lib.saveIdea(idea1)
        .then(id => {
          id1 = id
          return lib.saveIdea(idea2)
          .then(id => {
            id2 = id
          })
        })
      })

      it('Support idea', function() {
        return lib.ideaUp(id2)
        .then(supp => {
          supp.should.equal(1)
        })
        // Тест Up с одной идеей
      })

      it('Unsupport idea', function() {
        return lib.ideaDown(id1)
        .then(supp => {
          supp.should.equal(-1)
        })
      })
      // Тест down с одной идеей
      after(function() {
        return lib.clearIdeas()
      })
    })
})