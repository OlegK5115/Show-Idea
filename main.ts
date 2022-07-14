const express = require('express')
const app = express()

const config = require('config')
const port : number = config.port

const redis = require('redis')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const path = require('path')

import * as liquid from 'liquidjs'

const logger = require('morgan')
if (config.mode !== 'testing') {
    app.use(logger('dev'))
}

import * as ideas from './lib/ideas'
import * as users from './lib/users'
import * as support from './lib/support'

let poss : number

app.use(express.json())

const staticPath = 'public'
app.use(express.static(path.join(__dirname, staticPath)))

app.use(session({
    secret : 'qsxcdecftygbnjimko',
    store : new RedisStore({
        client : redis.createClient({
            url : 'redis://' + config.redis.host + '/' + config.redis.index // отвечает за то, под каким индексом базы данных произойдет регистрация сессии
        }), // creating a new client database connection
        prefix : 'show-idea:session:' // signature for sessions
    }),
    resave : true,
    saveUninitialized : false,
    cookie : {
        maxAge : 1000*60*60*24, // 24 hours
        httpOnly : false
    }
}))

const engine = new liquid.Liquid({
    root : __dirname,
    extname : '.liquid'
})
app.engine('liquid', engine.express())
app.set('views', [
    path.join(__dirname, 'public/views'),
    path.join(__dirname, 'public/layouts')
])
app.set('view engine', 'liquid')

async function main() {
    try {
        await ideas.setup()
        await users.setup()
        await support.setup()
        
        app.listen(port, async () => {
            if(config.mode != "testing"){
                console.log('http://localhost:' + port + '/')
            }
            const result = await ideas.getLength()
            poss = result
        })

        require('./api/ideas').setup(app)
        require('./api/users').setup(app)
        require('./api/support').setup(app)
        require('./routes/ideas').setup(app)
        require('./routes/support').setup(app)
        require('./routes/users').setup(app)
        require('./routes/home').setup(app)
        require('./routes/publish').setup(app)
        require('./routes/registration').setup(app)
        require('./routes/signin').setup(app)

        app.use(function(req, res) {
            res.status(404)

            if (req.accepts('html')) {
                res.render('404')
                return
            }
            else if (req.accepts('json')) {
                res.json({
                    status : false,
                    message : 'Error 404: page is not found'
                })
                return
            }
            else {
                res.text('Error 404: page is not found')
            }
        })
    }
    catch(err) {
        console.error(err)
    }
}

main()

module.exports = app
