import 'mocha'
const should = require('should')
import * as users from '../../lib/users'

describe('Users', function() {
    const userData : users.User = {
        name : "Alex",
        email : "alexf1989@example.com",
        password : "Pitbuli32"
    }

    before(async function() {
        await users.setup()
        await users.clearUsers()
        return
    })

    context('There is no users', function() {

        it('Getting empty list of users', async function() {
            const allUsers = await users.getAllUsers()
            should(allUsers).be.an.instanceOf(Array).and.have.lengthOf(0)
        })

        it('Getting user by mail', async function() {
            const user = await users.getUserByEmail(userData.email)
            should(user).be.equal(null)
        })

        it('Trying signin user', async function() {
            const user = await users.signin({
                email : userData.email,
                password : userData.password
            })
            should(user).be.equal(null)
        })

    })

    context('There is no users', function() {

        it('Regirstration without data', async function() {
            try {
                const userid = await users.registration(null)
                should.fail(userid, null, "Error UserID")
            }
            catch(err) {
                should(err.message).be.equal("Missing data")
            }
        })

        it('Regirstration user without name', async function() {
            try {
                const userid = await users.registration({
                    email : userData.email,
                    password : userData.password
                })
                should.fail(userid, null, "Error UserID")
            }
            catch (err) {
                should(err.message).be.equal("Missing name")
            }
        })

        it('Regirstration user', async function() {
            const userid = await users.registration(userData)
            should.notEqual(userid, null)
        })

        it('Regirstration user again', async function() {
            try {
                const userid = await users.registration(userData)
                should.fail(userid, null, "Error UserID")
            }
            catch (err) {
                should(err.message).be.equal("This user is already registered")
            }
        })

        after(function() {
            return users.clearUsers()
        })
    })

    context('There is one user', function() {

        before(async function() {
            userData._id = await users.registration(userData)
        })

        it('Getting one user', async function() {
            const allUsers = await users.getAllUsers()
            should(allUsers).be.an.instanceOf(Array).and.have.lengthOf(1)
        })

        it('Getting one user using his email', async function() {
            const user = await users.getUserByEmail(userData.email)
            should(user).have.property("name", userData.name)
            should(user).have.property("email", userData.email)
        })

        it('Trying find user using wrong email', async function() {
            const user = await users.getUserByEmail("wrong@example.com")
            should(user).be.equal(null)
        })

        it('Trying signin with wrong password (failure)', async function() {
            try {
                const user = await users.signin({
                    email : userData.email,
                    password : "wrong1505"
                })
                should.fail(user, null, "Error User")
            }
            catch(err) {
                should(err.message).be.equal("Wrong Password")
            }
        })

        after(function() {
            return users.clearUsers()
        })
    })
})
