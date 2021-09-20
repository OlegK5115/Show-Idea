const express = require('express')
const app = express()
const port = 2005

const redis = require('redis')
//const cookieParser = require('cookie-parser')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const config = require('config')

const staticPath = 'public'
const path = require('path')

const logger = require('morgan')
if (config.mode !== "testing") {
    app.use(logger('dev'));
}

const urlensodedParser = require("body-parser").urlencoded({extended : false})

const ideas = require('./lib/ideas')
const users = require('./lib/users')

let poss

app.use(express.static(path.join(__dirname, staticPath)))
//app.use(cookieParser())
app.use(session({
    secret : "qsxcdecftygbnjimko",
    store : new RedisStore({
        client : redis.createClient(), // creating a new client database connection
        prefix : 'show-idea:session:' // signature for sessions
    }),
    resave : true,
    saveUninitialized : true
}))

//!! ПРОБЛЕМА: я не создаю несколько сессий, я создаю одну и её изменяю

Promise.all([ideas.setup(), users.setup()]).then(statuses => {
    let success = true
    for (let status in statuses) {
        if (!status) {
            success = false
            break
        }
    }
    if (success) {
        app.listen(port, () => {
            console.log("http://localhost:" + port + "/")
            ideas.getLength().then(result => {
                poss = result
            })
        })
    }
})

app.get('/', (req, res) => {
    req.session.login = false
    res.sendFile(path.join(__dirname, staticPath + "/index.html"))
})

app.post('/poss', (req, res) => {
    res.send(poss.toString())
})

app.get('/public', (req, res) => {
    res.sendFile(path.join(__dirname, staticPath + "/public.html"))
})

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, staticPath + "/registration.html"))
})

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, staticPath + "/signin.html"))
})

//выход с аккаунта
app.get('/auth/logout', (req, res) => {

})

//получение данных при регистрации
app.post('/registration', urlensodedParser, (req, res) => {
    users.registration({name : req.body.user, email : req.body.email, password : req.body.password})
    .then(id => {
        res.redirect("/signin")
    })
})

//проверка пользователя при входе
app.post('/signin', urlensodedParser, (req, res) => {
    users.signin({email : req.body.email, password : req.body.password})
    .then(user => {
        req.session.login = true
        req.session.name = user.name
        req.session.email = user.email
        res.redirect("/")
    })
})

//проверка входа пользователя
app.post('/auth/check', (req, res) => {
    let rezult
    if(req.session.login){
        rezult = {status : req.session.login, name : req.session.name}
    }
    else{
        rezult = {status : false}
    }
    res.json(rezult)
})

//сохранение статьи
app.post('/public', urlensodedParser , (req, res) => {
    ideas.saveIdea({heading : req.body.heading, content :req.body.content}, req.session.email)
    .then(id => {
        res.redirect("/")
    })
})

//получение ссылок
app.get("/getlink", (req, res) => {
    ideas.getAllIdeas().then(result => {
        res.send(result)
    })
})

//получение статьи
app.get("/article/:id", (req, res) => {
    ideas.showIdea(req.params["id"])
    .then(idea => {
        if (!idea.status){
            res.statusCode = 404
        }
        if (req.headers['content-type'] == 'application/json') {
            res.json(idea)
        } else {
            res.sendFile(path.join(__dirname, staticPath + "/stack_idea.html"))
        }
    })
})

//повышение поддержки
app.post("/suppup/:id", urlensodedParser, (req, res) => {
    ideas.ideaUp(req.params["id"])
    res.end()
})

//понижение поддержки
app.post("/suppdown/:id", urlensodedParser, (req, res) => {
    ideas.ideaDown(req.params["id"])
    res.end()
})

module.exports = app