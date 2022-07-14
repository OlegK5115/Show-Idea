const Liquid = window.liquidjs.Liquid
const engine = new Liquid({
    extname: '.html',
    cache: true
})

const listeners = new Map()

addClickEvents()

async function addClickEvents() {

    const links = document.getElementsByTagName("a")
    const main = document.getElementById("main")

    for (let i = 0; i < links.length; i++) {
        if (!listeners.get(links[i])) {
            listeners.set(links[i], true)
            links[i].addEventListener('click', async function (e) {
                e.preventDefault()
                window.history.pushState("", "", this)
                const url = window.location
                const firstPart = url.pathname.split("/")[1]
                let response

                console.log(firstPart)
                console.log(url)

                switch (firstPart) {
                    case "":
                        response = await fetch("/views/home.browser.liquid")
                        if (response) {
                            const queryString = window.location.search
                            const urlParams = new URLSearchParams(queryString)
                            
                            const skip = parseInt(urlParams.get('skip')) || 0
                            const limit = parseInt(urlParams.get('limit')) || 5
        
                            const resultIdea = await fetch("/api/ideas?skip=" + skip + "&limit=" + limit, {
                                headers : {
                                    'Content-Type': 'application/json'
                                }
                            })
                            const ideas = await resultIdea.json()

                            const resultLength = await fetch("/api/ideas/length", {
                                headers : {
                                    'Content-Type': 'application/json'
                                }
                            })
                            const length = await resultLength.json()
                            console.log(length)
                            let prev = skip-limit >= 0 ? skip-limit : null
                            let next = length > skip+limit ? skip+limit : null
                            console.log(skip)
                            const view = await response.text()
                            const html = await engine.parseAndRender(view, {
                                prev : prev,
                                next : next,
                                limit : limit,
                                ideas : ideas
                            })
                            main.innerHTML = html
                        }
                        break;
                    case "registration":
                        response = await fetch("/views/registration.browser.liquid")
                        if (response) {
                            const view = await response.text()
                            const html = await engine.parseAndRender(view)
                            main.innerHTML = html
                        }
                        break;
                    case "signin":
                        response = await fetch("/views/signin.browser.liquid")
                        if (response) {
                            const view = await response.text()
                            const html = await engine.parseAndRender(view)
                            main.innerHTML = html
                        }
                        break;
                    case "publish":
                        response = await fetch("/views/publish.browser.liquid")
                        if (response) {
                            const view = await response.text()
                            const html = await engine.parseAndRender(view)
                            main.innerHTML = html
                        }
                        break;
                    case "ideas":
                        const id = links[i].getAttribute("href").split("/")[2]
                        console.log(id)
                        response = await fetch("/views/idea.browser.liquid")
                        if (response) {
                            const view = await response.text()
                            const result = await fetch("/api/ideas/" + id, {
                                headers : {
                                    'Content-Type': 'application/json'
                                }
                            })
                            const idea = await result.json()
        
                            const html = await engine.parseAndRender(view, {idea : idea})
                            main.innerHTML = html
                        }
                        break;
                    default:
                        response = await fetch("/views/404.browser.liquid")
                        if (response) {
                            const view = await response.text()
                            const html = await engine.parseAndRender(view)
                            main.innerHTML = html
                        }
                }
                addClickEvents()
                console.log(listeners)
            })
        }
    }    
}

/* async function checkAuth() {
    const auth = await fetch('/api/users/check')
    const index = await fetch('layouts/index.liquid')
    if (index) {
        const layout = index.text()
        const html = await engine.parseAndRender(layout, {
            login : auth.status,
            name : auth.name
        })
        document.documentElement.innerHTML = html
    }
}
checkAuth() */
