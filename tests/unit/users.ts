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
            should(user).be.undefined
        })

        it('Trying signin user', async function() {
            const result = await users.signin({
                email : userData.email,
                password : userData.password
            })
            should(result).have.property('status')
            should(result.status).be.equal(false)
            should(result).have.property('message')
            should(result.message).be.equal("Can't find user")
        })

    })

    context('There is no users', function() {

        it('Regirstration without data', async function() {
            const result = await users.registration(null)
            should(result).have.property('status')
            should(result.status).be.equal(false)
            should(result).have.property('message')
        })

        it('Regirstration user without name', async function() {
            const result = await users.registration({
                email : userData.email,
                password : userData.password
            })
            should(result).have.property('status')
            should(result.status).be.equal(false)
            should(result).have.property('message')
        })

        it('Regirstration user', async function() {
            const result = await users.registration(userData)
            should(result).have.property('status')
            should(result.status).be.equal(true)
            should(result).have.property('message')
            should(result).have.property('userid')
        })

        it('Regirstration user again', async function() {
            const result = await users.registration(userData)
            should(result).have.property('status')
            should(result.status).be.equal(false)
            should(result).have.property('message')
        })

        after(function() {
            return users.clearUsers()
        })
    })

    context('There is one user', function() {

        before(async function() {
           const res = await users.registration(userData)
           userData._id = res.userid
        })

        it('Getting one user', async function() {
            const resultUsers = await users.getAllUsers()
            should(resultUsers).be.an.instanceOf(Array).and.have.lengthOf(1)
        })

        it('Getting one user using his email', async function() {
            const resultUser = await users.getUserByEmail(userData.email)
            should(resultUser).have.property("name", userData.name)
            should(resultUser).have.property("email", userData.email)
            should(resultUser).have.property("password", userData.password)
        })

        it('Trying find user using wrong email', async function() {
            const user = await users.getUserByEmail("wrong@example.com")
            should(user).be.undefined
        })

        after(function() {
            return users.clearUsers()
        })
    })
})
