let chet
let beg = 0, end = 9
let tablePoss = document.querySelectorAll("div.poss")
let login = false

function start(){
    checkAuth()
    getLink(beg.toString(), end.toString())
}

function checkAuth() {
    const ajax = new XMLHttpRequest()
    let signin = document.getElementById("signIn")
    let register = document.getElementById("register")
    let public = document.getElementById("public_idea")
    ajax.responseType = "json"
    ajax.onload = function(){
        login = ajax.response.status
        if(this.status != 200){
            console.log(this.status + ":" + this.statusText)
        }
        else if(ajax.response.status){
            signin.innerHTML = ajax.response.name
            register.innerHTML = "log out"
            register.setAttribute("href", "/auth/logout")
            public.style.pointerEvent = true
        }
    }
    ajax.open("POST", "/auth/check")
    ajax.send()
}

function getChet(){
    const ajax = new XMLHttpRequest()
    ajax.onload = function(){
        if(this.status != 200){
            console.log(this.status + ":" + this.statusText)
        }
        else{
            chet = parseInt(ajax.response)
        }
    }
    ajax.open("POST", "/poss")
    ajax.send()
}

function publicIdea(){
    if(login){
        window.location.replace('/public')
    }
}

function suppUp(ident){
    const ajax = new XMLHttpRequest()
    let saveID = document.querySelectorAll("input.saveID")
    if(login){
        ajax.onload = function(){
            if(this.status != 200){
                console.log(this.status + ":" + this.statusText)
            }
            else{
                getLink(beg.toString(), end.toString())
            }
        }
        ajax.open("POST", "/suppup/" + saveID[ident].getAttribute("value"))
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        ajax.send()
    }
}
function suppDown(ident){
    const ajax = new XMLHttpRequest()
    let saveID = document.querySelectorAll("input.saveID")
    if(login){
        ajax.onload = function(){
            if(this.status != 200){
                console.log(this.status + ":" + this.statusText)
            }
            else{
                getLink(beg.toString(), end.toString())
            }
        }
        ajax.open("POST", "/suppdown/" + saveID[ident].getAttribute("value"))
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        ajax.send()
    }
}
function previousArticles(){
    if(beg > 0){
        beg -= 9
        end -= 9
        let tablePoss = document.querySelectorAll("div.poss")
        for(let i = 0; i < 9; i++){
            tablePoss[i].innerHTML = (parseInt(tablePoss[i].innerHTML)-9).toString()
        }
        getLink(beg, end)
    }
}
function nextArticles(){
    if(((end + 9) - chet) < 9){
        beg += 9
        end += 9
        let tablePoss = document.querySelectorAll("div.poss")
        for(let i = 0; i < 9; i++){
            tablePoss[i].innerHTML = (parseInt(tablePoss[i].innerHTML)+9).toString()
        }
        getLink(beg,  end)
    }
}
