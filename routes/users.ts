const urlencodedParser = require('body-parser').urlencoded({extended : false})

import * as users from '../lib/users'

export function setup(app) {

    app.post('/users', urlencodedParser, async (req, res) => {
        try {
            await users.registration({
                name : req.body.name,
                email : req.body.email,
                password : req.body.password
            })
            res.redirect("/signin")
        }
        catch (err) {
            console.error(err.message)
            res.redirect("/registration")
        }
    })

    app.post('/users/signin', urlencodedParser, async (req, res) => {
        try {
            const user = await users.signin({
                email : req.body.email,
                password : req.body.password
            })
            if(!!user){
                req.session.login = true
                req.session.name = user.name
                req.session.email = user.email
                res.redirect("/")
            }
            else {
                res.redirect("/signin")
            }
        }
        catch (err) {
            console.error(err.message)
            res.redirect("/signin")
        }
    })

    app.post('/users/logout', (req, res) => {
        delete req.session.name
        delete req.session.email
        delete req.session.login
        req.session.destroy(function () {
            res.redirect("/")
        })
    })
}
