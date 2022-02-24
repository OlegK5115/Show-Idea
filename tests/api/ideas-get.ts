const supertest = require('supertest')

import * as ideasDb from '../../lib/ideas'
import * as usersDb from '../../lib/users'

describe('GET /article/:id', function() {
    let app
    let agent


    before(function () {
        return Promise.all([ideasDb.setup(), usersDb.setup()])
        .then(() => {
            return Promise.all([ideasDb.clearIdeas(), usersDb.clearUsers()])
            .then(() => {
                app = require('../../main')
                agent = supertest.agent(app, {}) // supertest(app)
                return
            })
        })
    })

    context('No Ideas', function() {


        it('Idea not found', function() {
            return agent
            .get('/article/AAAAAAAAAAAAAAAAAAAAAAAA')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .expect(404)
            .then(res => {
                res.body.should.have.property("status")
                res.body.status.should.equal(false, res.body.msg)
            })
        })
    })

    context('There is one idea', function() {
        before(function() {
            return agent
            .post('/registration')
            .send({user : 'dinosaur', email : 'dinosaur@example.com', password : 'rrrrrrrr'}) // почему объект нулевой
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect(200)
            .then(() => {
                return agent
                .post('/signin')
                .send({email : 'dinosaur@example.com', password : 'rrrrrrrr'})
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(rezult => {
                    
                })
            })
        })
        it('Idea not found', function() {
            return agent
            .get('/article/AAAAAAAAAAAAAAAAAAAAAAAA')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .expect(404)
            .then(res => {})
        })
        after(function() {
            return agent
            .get('/auth/logout')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .expect(200)
        })
    })

    after(function () {
        return ideasDb.clearIdeas()
        .then(() => {
            usersDb.clearUsers()
        })
    })
})
