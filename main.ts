const express = require('express')
const app = express()

const config = require('config')
const port : number = config.port

const redis = require('redis')
//const cookieParser = require('cookie-parser')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const staticPath = 'public'
const path = require('path')

const logger = require('morgan')
if (config.mode !== "testing") {
    app.use(logger('dev'));
}

const urlensodedParser = require("body-parser").urlencoded({extended : false}) // парсит форму

const ideas = require('./lib/ideas')
const users = require('./lib/users')

let poss : number

//app.use(require("body-parser").json({type : "application/json"}))

app.use(express.json()) // парсит body как json объект

app.use(express.static(path.join(__dirname, staticPath)))
//app.use(cookieParser())
app.use(session({
    secret : "qsxcdecftygbnjimko",
    store : new RedisStore({
        client : redis.createClient({
            url : "redis://" + config.redis.host + "/" + config.redis.index // отвечает за то, под каким индексом базы данных произойдет регистрация сессии
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

async function main() {
    const status1 = await ideas.setup()
    const status2 = await users.setup()
    let success : Boolean = true
    if(!status1 || !status2){
        success = false
    }
    if (success) {
        app.listen(port, async () => {
            console.log("http://localhost:" + port + "/")
            const result = await ideas.getLength()
            poss = result
        })
    }

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, staticPath + "/index.html"))
    })

    app.post('/poss', (req, res) => {
        res.send(poss.toString())
    })

    app.get('/public', (req, res) => {
        if(req.session.login){
            res.sendFile(path.join(__dirname, staticPath + "/public.html"))
        }
        else{
            res.redirect("/")
        }
    })

    app.get('/registration', (req, res) => {
        res.sendFile(path.join(__dirname, staticPath + "/registration.html"))
    })

    app.get('/signin', (req, res) => {
        res.sendFile(path.join(__dirname, staticPath + "/signin.html"))
    })

    app.get('/auth/logout', (req, res) => {
        const result = {
            status : false,
            deleteName : req.session.name
        }
        delete req.session.name
        delete req.session.email
        delete req.session.login
        req.session.destroy(function () {
            result.status = true
            if(req.headers['content-type'] == 'application/json'){
                res.json(result)
            }
            else {
                res.redirect("/")
            }
        })
    })

    app.post('/registration', urlensodedParser, async (req, res) => {
        try {
            const userid = await users.registration({
                name : req.body.user,
                email : req.body.email,
                password : req.body.password
            })
            if (req.headers['content-type'] == 'application/json') {
                const result = {
                    status : true,
                    userid : userid,
                    message : "User registrated sucessful"
                }
                res.json(result)
            }
            else {
                res.redirect("/signin")
            }
        }
        catch (err) {
            if (req.headers['content-type'] == 'application/json') {
                const result = {
                    status : false,
                    userid : null,
                    message : err.message
                }
                res.json(result)
            }
            else {
                res.redirect("/registration")
            }
        }
    })

    app.post('/signin', urlensodedParser, async (req, res) => {
        try {
            const user = await users.signin({
                email : req.body.email,
                password : req.body.password
            })
            if(req.headers['content-type'] == 'application/json') {
                const result = {
                    status : true,
                    user : user,
                    message : "User was not authorized"
                }
                if(!!user){
                    req.session.login = true
                    req.session.name = user.name
                    req.session.email = user.email
                    result.message = "User authorized succesful"
                }
                res.json(result)
            }
            else{
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
        }
        catch (err) {
            if (req.headers['content-type'] == 'application/json') {
                const result = {
                    status : false,
                    user : null,
                    message : err.message
                }
                res.json(result)
            }
            else {
                res.redirect("/signin")
            }
        }
    })

    app.get('/auth/check', (req, res) => {
        let result = {}
        if(req.session.login){
            result = {status : req.session.login, name : req.session.name}
        }
        else {
            result = {status : false}
        }
        res.json(result)
    })
    
    app.post('/public', urlensodedParser , async (req, res) => {
        if(req.session.login){
            await ideas.saveIdea(
                {
                    heading : req.body.heading,
                    content :req.body.content
                },
                req.session.email
            )
            res.redirect("/")
        }
        else{
            res.redirect("/")
        }
    })

    app.get("/getlink", async (req, res) => {
        res.send(await ideas.getAllIdeas())
    })

    app.get("/article/:id", async (req, res) => {
        const idea = await ideas.showIdea(req.params["id"])
        if (!idea){
            res.statusCode = 404
        }
        if (req.headers['content-type'] == 'application/json') {
            res.json(idea)
        }
        else {
            res.sendFile(path.join(__dirname, staticPath + "/stack_idea.html"))
        }
    })

    app.post("/suppup/:id", urlensodedParser, async (req, res) => {
        await ideas.ideaUp(req.session.email, req.params["id"])
        res.end()
    })

    app.post("/suppdown/:id", urlensodedParser, async (req, res) => {
        await ideas.ideaDown(req.session.email, req.params["id"])
        res.end()
    })
}

main()

module.exports = app
