const supertest = require('supertest')

const should = require("should")

import * as ideasDb from '../../lib/ideas'
import * as usersDb from '../../lib/users'

describe('GET /ideas/:id', function() {
    let app
    let agent


    before(async function () {
        await ideasDb.setup()
        await usersDb.setup()
        await ideasDb.clearIdeas()
        await usersDb.clearUsers()
        app = require('../../main')
        agent = supertest.agent(app, {}) // supertest(app)
    })

    const userData : usersDb.User = {
        name : "dinosaur",
        email : "dinosaur@example.com",
        password : "rrrrrrrr"
    }

    const ideaData : ideasDb.Idea = {
        heading : "Test1",
        content : "This is test1"
    }

    context('No Ideas', function() {

        it('Idea not found', async function() {
            await agent
                .get('/api/ideas/AAAAAAAAAAAAAAAAAAAAAAAA')
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(404)
            return
        })
    })

    context('There is no idea', function() {
        before(async function() {
            const result = await agent
                .post('/api/users')
                .send(userData)
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
            userData._id = result.userid
            await agent
                .post('/api/users/signin')
                .send({email : userData.email, password : userData.password})
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)
            return
        })
        
        it('Idea not found', function() {
            return agent
            .get('/api/ideas/AAAAAAAAAAAAAAAAAAAAAAAA')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .expect(404)
        })

        after(function() {
            return agent
            .post('/api/users/logout')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .expect(200)
        })
    })

    context('There is one Idea', function() {
        before(async function() {
            const resultUserId = await agent
                .post('/api/users')
                .send(userData)
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
            await agent
                .post('/api/users/signin')
                .send({email : userData.email, password : userData.password})
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)
            const resultIdeaId = await agent
                .post('/api/ideas')
                .send(ideaData)
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)
            userData._id = resultUserId.body.userid
            ideaData._id = resultIdeaId.body.ideaid
            return
        })

        it('Show all Idea', async function() {
            const allIdeas = await agent
                .get('/api/ideas')
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)

            should(allIdeas._body).be.an.instanceOf(Array).and.have.lengthOf(1)
        })

        after(function() {
            return agent
                .post('/api/users/logout')
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
        })
    })

    after(async function () {
        await ideasDb.clearIdeas()
        await usersDb.clearUsers()
        return
    })
})
