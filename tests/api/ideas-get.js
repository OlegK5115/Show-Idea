const supertest = require('supertest')

const ideasDb = require('../../lib')

describe('GET /article/:id', function() {
    let app
    let agent


    before(function () {
        return ideasDb.setup()
        .then(() => {
            return ideasDb.clearIdeas()
        })
        .then(() => {
            app = require('../../main')
            agent = supertest.agent(app)
            return 
        })
    })

    context('No Ideas', function() {
        it('Idea not found', function() {
            return agent
            .get('/article/AAAAAAAAAAAAAAAAAAAAAAAA')
            .set('X-Request-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(404)
            .then(res => {
                res.body.should.have.property("status")
                res.body.status.should.equal(false, res.body.msg)
            })
        })
    })

    after(function () {
        return ideasDb.clearIdeas()
    })
})