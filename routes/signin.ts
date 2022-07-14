export async function setup(app) {
    app.get('/signin', async (req, res) => {
        res.render('signin')
    })
}
