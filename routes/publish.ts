export async function setup(app) {

    app.get('/publish', async (req, res) => {
        if(req.session.login){
            res.render('publish')
        }
        else {
            res.redirect("/signin")
        }
    })
}
