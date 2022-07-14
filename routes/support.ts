const urlencodedParser = require('body-parser').urlencoded({extended : false})

import * as users from '../lib/users'
import * as support from '../lib/support'

export function setup(app) {
    
    app.post("/ideas/:id/supp", urlencodedParser, async (req, res) => {
        try {
            if (req.session.login){
                const id = (await users.getUserByEmail(req.session.email))._id
                await support.setSupport(id, req.params["id"], 1)
            }
        }
        catch(err) {
            console.error(err.message)
        }
        res.redirect(req.headers.referer)
    })

    app.post("/ideas/:id/unsupp", urlencodedParser, async (req, res) => {
        try {
            if(req.session.login){
                const id = (await users.getUserByEmail(req.session.email))._id
                await support.setSupport(id, req.params["id"], -1)
            }
        }
        catch(err) {
            console.error(err.message)
        }
        res.redirect(req.headers.referer)
    })
}
