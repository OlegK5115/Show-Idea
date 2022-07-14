const urlencodedParser = require('body-parser').urlencoded({extended : false})

import * as users from '../lib/users'
import * as support from '../lib/support'

export function setup(app) {
    
    app.post("/api/ideas/:id/supp", urlencodedParser, async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        let answer
        try {
            if (req.session.login){
                const id = (await users.getUserByEmail(req.session.email))._id
                await support.setSupport(id, req.params["id"], 1)
                answer = {
                    status : true,
                    message : "Idea support succesful"
                }
            }
            else{
                answer = {
                    status : false,
                    message : "User ins't sign in"
                }
            }
        }
        catch(err) {
            answer = {
                status : false,
                message : err.message
            }
        }
        res.json(answer)
    })

    app.post("/api/ideas/:id/unsupp", urlencodedParser, async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        let answer
        try {
            if(req.session.login){
                const id = (await users.getUserByEmail(req.session.email))._id
                await support.setSupport(id, req.params["id"], -1)
                answer = {
                    status : true,
                    message : "Idea unsupport succesful"
                }
            }
            else {
                answer = {
                    status : true,
                    message : "User isn`t sign in"
                }
            }
        }
        catch(err) {
            answer = {
                status : false,
                message : err.message
            }
        }
        res.json(answer)
    })
}
