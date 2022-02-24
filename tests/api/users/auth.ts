const supertest = require('supertest')

const should = require("should")

import * as ideasDb from '../../../lib/ideas'
import * as usersDb from '../../../lib/users'

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
            agent = supertest.agent(app, {})
            return
        })
    })
    
    context('Registration, signin and logout', function() {

        it('Check authorization anonimous user', function() {
            return agent
            .get('/auth/check')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .then(rezult => {
                should(rezult.body).have.property('status')
                should(rezult.body.status).equal(false)
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
                rezult.body.status.should.equal(true) 
                rezult.body.should.have.property('message')
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
            .get('/auth/check')
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
