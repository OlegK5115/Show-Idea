import * as ideas from '../lib/ideas'
import * as support from '../lib/support'

export async function setup(app) {

    app.get('/', async (req, res) => {
        const skip = parseInt(req.query["skip"]) || 0
        const limit = parseInt(req.query["limit"]) || 5
        
        const allIdeas = (await support.sortIdeasBySupport(await ideas.getAllIdeas()))
            .slice(skip, skip+limit)
        allIdeas.forEach((idea, i) => {
            idea['position'] = i+1
        })
        let prev = skip-limit >= 0 ? skip-limit : null
        let next = skip+limit < await ideas.getLength() ? skip+limit : null
        
        res.render('home', {
            'login' : req.session.login,
            'name' : req.session.name,
            'prev' : prev,
            'next' : next,
            'limit' : limit,
            ideas : allIdeas
        })
    })
}
