const supertest = require('supertest')

const should = require("should")

import * as ideasDb from '../../lib/ideas'
import * as usersDb from '../../lib/users'

describe('POST for ideas', function() {
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
        name : 'dinosaur',
        email : 'dinosaur@example.com',
        password : 'rrrrrrrr'
    }

    const ideaData : ideasDb.Idea = {
        heading : "Test1",
        content : "This is test1"
    }

    context('There is one idea', function() {
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

        it('Idea support', async function() {
            await agent
                .post('/api/ideas/' + ideaData._id + '/supp')
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)
            return
        })

        it('Idea unsupport', async function() {
            await agent
                .post('/api/ideas/' + ideaData._id + '/unsupp')
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)
            return
        })

        after(async function() {
            await agent
                .post('/api/users/logout')
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
            await ideasDb.clearIdeas()
            await usersDb.clearUsers()
        })
    })
})
