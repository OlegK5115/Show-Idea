const urlencodedParser = require('body-parser').urlencoded({extended : false})

import * as ideas from '../lib/ideas'

export function setup(app) {

    app.post('/ideas', urlencodedParser , async (req, res) => {
        if(req.session.login){
            await ideas.saveIdea(
                {
                    heading : req.body.heading,
                    content : req.body.content
                },
                req.session.email
            )
        }
        res.redirect("/")
    })


    app.get("/ideas/:id", async (req, res) => {
        const idea = await ideas.getIdeaByID(req.params["id"])
        if (!idea){
            res.status(404).end()
            return
        }
        
        res.render('idea', { idea : idea } )
    })
}
