const supertest = require('supertest')

const ideasDb = require('../../../lib/ideas')
const usersDb = require('../../../lib/users')
const { settings } = require('../../../main')

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
    
    context('Registration, signin and logout', function() {

        it('Check authorization anonimous user', function() {
            return agent
            .post('/auth/check')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                rezult.body.should.have.property('status')
                rezult.body.status.should.equal(false)
            })
        })

        it('User registration', function() {
            return agent
            .post('/registration')
            .send({user : 'dinosaur', email : 'dinosaur@example.com', password : 'rrrrrrrr'})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                rezult.body.should.have.property('status')
                rezult.body.status.should.equal(true) // equal() - равенство с указанным знач.
                rezult.body.should.have.property('message') // property() - название поля
            })
        })

        it('Wrong user signin', function() {
            return agent
            .post('/signin')
            .send({email : 'dinosaur@example.com', pasword : 'roar'})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                rezult.body.should.have.property('status')
                rezult.body.status.should.equal(false)
                rezult.body.should.have.property('message')
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

        it('Check authorization user', function() {
            return agent
            .post('/auth/check')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                rezult.body.should.have.property('status')
                rezult.body.status.should.equal(true)
                rezult.body.should.have.property('name')
                rezult.body.name.should.equal('dinosaur')
            })
        })

        it('User logout', function(){
            return agent
            .get('/auth/logout')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                rezult.body.should.have.property('status')
                rezult.body.status.should.equal(true)
                rezult.body.should.have.property('deleteName')
                rezult.body.deleteName.should.equal('dinosaur')
            })
        })
    })

    // check auth, logout

    after(function () {
        return ideasDb.clearIdeas()
        .then(() => {
            usersDb.clearUsers()
        })
    })
})