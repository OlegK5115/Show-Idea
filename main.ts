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

const urlensodedParser = require("body-parser").urlencoded({extended : false}) // парсит форму

const ideas = require('./lib/ideas')
const users = require('./lib/users')

let poss

//app.use(require("body-parser").json({type : "application/json"}))

app.use(express.json()) // парсит body как json объект

app.use(express.static(path.join(__dirname, staticPath)))
//app.use(cookieParser())
app.use(session({
    secret : "qsxcdecftygbnjimko",
    store : new RedisStore({
        client : redis.createClient(), // creating a new client database connection
        prefix : 'show-idea:session:' // signature for sessions
    }),
    resave : true,
    saveUninitialized : false,
    cookie : {
        maxAge : 1000*60*60*24, // 24 hours
        httpOnly : false
    }
}))

/* Сессия создается при входе на сайт в браузере. При входе на другой
аккаунт использовать другой браузер */

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

//выход с аккаунта
app.get('/auth/logout', (req, res) => {
    const result = {
        status : false,
        deleteName : req.session.name
    }
    delete req.session.name
    delete req.session.email
    delete req.session.login
    req.session.destroy(function () {
        //уничтожение текущей сессии.
        /*При использовании store.destroy(id, callback) идет
        удаление сессии внутри хранилища по id*/
        result.status = true
        if(req.headers['content-type'] == 'application/json'){
            res.json(result)
        }
        else {
            res.redirect("/")
        }
    })
})

//получение данных при регистрации
app.post('/registration', urlensodedParser, (req, res) => {
    users.registration({name : req.body.user, email : req.body.email, password : req.body.password})
    .then(rezult => {
        if(req.headers['content-type'] == 'application/json') {
            res.json(rezult)
        }
        else {
            if(rezult.status){
                res.redirect("/signin")
            }
            else{
                res.redirect("/registration")
            }
        }
    })
})

//проверка пользователя при входе
app.post('/signin', urlensodedParser, (req, res) => {
    users.signin({email : req.body.email, password : req.body.password})
    .then(rezult => {
        if(req.headers['content-type'] == 'application/json') {
            if(rezult.status){
                req.session.login = true
                req.session.name = rezult.user.name
                req.session.email = rezult.user.email
            }
            res.json(rezult)
        }
        else{
            if(rezult.status){
                req.session.login = true
                req.session.name = rezult.user.name
                req.session.email = rezult.user.email
                res.redirect("/")
            }
            else {
                res.redirect("/signin")
            }
        }
    })
})

//проверка входа пользователя
app.post('/auth/check', (req, res) => {
    let rezult = {}
    if(req.session.login){
        rezult = {status : req.session.login, name : req.session.name}
    }
    else {
        rezult = {status : false}
    }
    res.json(rezult)
})

// существует req.session.id
//сохранение статьи
app.post('/public', urlensodedParser , (req, res) => {
    if(req.session.login){
        ideas.saveIdea({heading : req.body.heading, content :req.body.content}, req.session.email)
        .then(id => {
            res.redirect("/")
        })
    }
    else{
        res.redirect("/")
    }
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
    ideas.ideaUp(req.session.email, req.params["id"])
    .then(result => {
        res.end()
    })
})

//понижение поддержки
app.post("/suppdown/:id", urlensodedParser, (req, res) => {
    ideas.ideaDown(req.session.email, req.params["id"])
    .then(result => {
        res.end()
    })
})

module.exports = app
