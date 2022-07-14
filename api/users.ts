const urlencodedParser = require('body-parser').urlencoded({extended : false})

import * as users from '../lib/users'

export function setup(app) {

    app.get('/api/users/check', (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        let answer = {}
        if(req.session.login){
            answer = { 
                status : req.session.login,
                name : req.session.name
            }
        }
        else {
            answer = {status : false}
        }
        res.json(answer)
    })

    app.post('/api/users', urlencodedParser, async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        let answer
        try {
            const userid = await users.registration({
                name : req.body.name,
                email : req.body.email,
                password : req.body.password
            })
            answer = {
                status : true,
                userid : userid,
                message : "User registrated sucessful"
            }
        }
        catch (err) {
            answer = {
                status : false,
                message : err.message
            }
        }
        res.json(answer)
    })

    app.post('/api/users/signin', urlencodedParser, async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        let answer
        try {
            const user = await users.signin({
                email : req.body.email,
                password : req.body.password
            })
            if(!!user){
                req.session.login = true
                req.session.name = user.name
                req.session.email = user.email
                answer = {
                    status : true,
                    user : user,
                    message : "User authorized succesful"
                }
            }
            else{
                answer = {
                    status : false,
                    message : "Wrong email or password"
                }
            }
        }
        catch (err) {
            answer = {
                status : false,
                message : err.message
            }
        }
        res.json(answer)
    })

    app.post('/api/users/logout', (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        const answer = {
            status : false,
            deleteName : req.session.name
        }
        delete req.session.name
        delete req.session.email
        delete req.session.login
        req.session.destroy(function() {
            answer.status = true
            res.json(answer)
        })
    })
}
