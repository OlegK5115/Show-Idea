const urlencodedParser = require('body-parser').urlencoded({extended : false})

import * as support from '../lib/support'
import * as ideas from '../lib/ideas'

export function setup(app) {

    app.get('/api/ideas', async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }
        
        const skip = parseInt(req.query["skip"]) || 0
        const limit = parseInt(req.query["limit"]) || 5
        
        const allIdeas = (await support.sortIdeasBySupport(await ideas.getAllIdeas()))
            .slice(skip, skip+limit)
        allIdeas.forEach((idea, i) => {
            idea['position'] = i+1
        })
        
        res.json(allIdeas)
    })


    app.get("/api/ideas/length", async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }
        
        res.json(await ideas.getLength())
    })

    app.post('/api/ideas', urlencodedParser , async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        let answer = {}
        if(req.session.login){
            const id = await ideas.saveIdea(
                {
                    heading : req.body.heading,
                    content : req.body.content
                },
                req.session.email
            )
            answer = {
                status : true,
                ideaid : id,
                message : "Idea published succesful"
            }
        }
        else{
            answer = {
                status : false,
                message : "User wasn`t logged in"
            }
        }
        res.json(answer)
    })

    app.get("/api/ideas/:id", async (req, res) => {
        if (req.headers['content-type'] != 'application/json') {
            res.status(415).end()
            return
        }

        const idea = await ideas.getIdeaByID(req.params["id"])
        if (!idea){
            res.status(404).end()
            return
        }
        res.json(idea)
    })
}
