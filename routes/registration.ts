export async function setup(app) {
    app.get('/registration', async (req, res) => {
        res.render('registration')
    })
}
