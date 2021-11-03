const supertest = require('supertest')

const ideasDb = require('../../../lib/ideas')
const usersDb = require('../../../lib/users')

describe('user reqistration', function() {

    let app
    let agent


    before(function () {
        return Promise.all([ideasDb.setup(), usersDb.setup()])
        .then(() => {
            return Promise.all([ideasDb.clearIdeas(), usersDb.clearUsers()])
        })
        .then(() => {
            app = require('../../../main')
            agent = supertest.agent(app)
            return
        })
    })
    
    context('Registration and signin', function() {
        // TODO: Проверка неправильных входных данных
        it('User registration', function() {
            return agent
            .post('/registration')
            .send({name : 'dinosaur', email : 'dinosaur@example.com', password : 'rrrrrrrr'})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                rezult.body.should.have.property('status')
                rezult.body.status.should.equal(true) // equal() - равенство с указанным знач.
                rezult.body.should.have.property('message') // property() - название поля
            })
        })

        it('User signin', function() {
            return agent
            .post('/signin')
            .send({email : 'dinosaur@example.com', password : 'rrrrrrrr'})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                rezult.body.should.have.property('status')
                rezult.body.status.should.equal(true)
                rezult.body.should.have.property('message')
            })
        })
    })

    after(function () {
        return ideasDb.clearIdeas()
        .then(() => {
            usersDb.clearUsers()
        })
    })
})