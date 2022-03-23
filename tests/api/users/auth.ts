const supertest = require('supertest')

const should = require("should")

import * as ideasDb from '../../../lib/ideas'
import * as usersDb from '../../../lib/users'

describe('user reqistration', function() {

    let app
    let agent


    before(async function () {
        await ideasDb.setup()
        await usersDb.setup()
        await ideasDb.clearIdeas()
        await usersDb.clearUsers()
        app = require('../../../main')
        agent = supertest.agent(app, {})
        return
    })
    
    context('Registration, signin and logout', function() {

        it('Check authorization anonimous user', async function() {
            const result = await agent
            .get('/auth/check')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            should(result.body).have.property('status')
            should(result.body.status).equal(false)
        })

        it('User registration', async function() {
            const result = await agent
            .post('/registration')
            .send({user : 'dinosaur', email : 'dinosaur@example.com', password : 'rrrrrrrr'})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            should.notEqual(result.body, null)
        })

        it('User registration without data (failure)', async function() {
            const result = await agent
            .post('/registration')
            .send({})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            should(result.body).have.property('status')
            should(result.body.status).equal(false)
            should(result.body).have.property('message')
        })

        it('Wrong user signin', async function() {
            const result = await agent
            .post('/signin')
            .send({email : 'dinosaur@example.com', pasword : 'roar'})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            should(result.body).have.property("status")
            should(result.body.status).be.equal(false)
            should(result.body).have.property("message")
        })

        it('User signin', async function() {
            const result = await agent
            .post('/signin')
            .send({email : 'dinosaur@example.com', password : 'rrrrrrrr'})
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            should.notEqual(result.body, null)
        })

        it('Check authorization user', async function() {
            const result = await agent
            .get('/auth/check')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            result.body.should.have.property('status')
            result.body.status.should.equal(true)
            result.body.should.have.property('name')
            result.body.name.should.equal('dinosaur')
        })

        it('User logout', async function(){
            const result = await agent
            .get('/auth/logout')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            result.body.should.have.property('status')
            result.body.status.should.equal(true)
            result.body.should.have.property('deleteName')
            result.body.deleteName.should.equal('dinosaur')
        })
    })

    // check auth, logout

    after(async function () {
        await ideasDb.clearIdeas()
        await usersDb.clearUsers()
        return
    })
})
