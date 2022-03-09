const supertest = require('supertest')

import * as ideasDb from '../../lib/ideas'
import * as usersDb from '../../lib/users'

describe('GET /article/:id', function() {
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

    context('No Ideas', function() {


        it('Idea not found', async function() {
            const res = await agent
                .get('/article/AAAAAAAAAAAAAAAAAAAAAAAA')
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(404)

            res.body.should.have.property("status")
            res.body.status.should.equal(false, res.body.msg)
            return
        })
    })

    context('There is one idea', function() {
        before(async function() {
            await agent
                .post('/registration')
                .send({user : 'dinosaur', email : 'dinosaur@example.com', password : 'rrrrrrrr'})
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
            const rezult = await agent
                .post('/signin')
                .send({email : 'dinosaur@example.com', password : 'rrrrrrrr'})
                .set('X-Request-With', 'XMLHttpRequest')
                .set('Content-Type', 'application/json')
                .expect(200)
            return
        })
        /*При помощи Agent можно сделать запрос на сессию */
        it('Idea not found', function() {
            return agent
            .get('/article/AAAAAAAAAAAAAAAAAAAAAAAA')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .expect(404)
        })
        /* Уже должна быть создана сессия*/
        after(function() {
            return agent
            .get('/auth/logout')
            .set('X-Request-With', 'XMLHttpRequest')
            .set('Content-Type', 'application/json')
            .expect(200)
            // 302 Found - при перезагрузке страницы (redirect)
        })
    })

    after(async function () {
        await ideasDb.clearIdeas()
        await usersDb.clearUsers()
        return
    })
})
