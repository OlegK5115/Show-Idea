const express = require('express')
const app = express()
const port = 2005

const config = require('config')

const staticPath = 'public'
const path = require('path')

const logger = require('morgan')
if (config.mode !== "testing") {
    app.use(logger('dev'));
}

let dbase, collect

const urlensodedParser = require("body-parser").urlencoded({extended : false})

const lib = require('./lib')

let poss

app.use(express.static(path.join(__dirname, staticPath)))

lib.setup().then(status => {
    if (status) {
        app.listen(port, () => {
            console.log("http://localhost:" + port + "/")
            lib.getLength().then(result => {
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
    res.sendFile(path.join(__dirname, staticPath + "/public.html"))
})

//сохранение статьи
app.post('/public', urlensodedParser , (req, res) => {
    lib.saveIdea({heading : req.body.heading, content :req.body.content})
    .then(id => {
        res.redirect("/")
    })
})

//получение ссылок
app.get("/getlink", (req, res) => {
    lib.getAllIdeas().then(result => {
        res.send(result)
    })
})

//получение статьи
app.get("/article/:id", (req, res) => {
    lib.showIdea(req.params["id"])
    .then(idea => {
        if (!idea.status){
            res.statusCode = 404
        }
        console.log(req.headers['content-type'])
        if (req.headers['content-type'] == 'application/json') {
            res.json(idea)
        } else {
            res.sendFile(path.join(__dirname, staticPath + "/stack_idea.html"))
        }
    })
})

//повышение поддержки
app.post("/suppup/:id", urlensodedParser, (req, res) => {
    lib.ideaUp(req.params["id"])
    res.end()
})

//понижение поддержки
app.post("/suppdown/:id", urlensodedParser, (req, res) => {
    lib.ideaDown(req.params["id"])
    res.end()
})

module.exports = app