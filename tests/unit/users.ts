import 'mocha'
const should = require('should')
import * as users from '../../lib/users'



describe('Users', function() {
    const user : users.User = {
        name : "Alex",
        email : "alexf1989@example.com",
        password : "Pitbuli32"
    }

    before(function() {
        return users.setup()
        .then(() => {
          return users.clearUsers()
        })
    })

    context('There is no users', function() {

        it('Getting empty list of users', function() {
            return users.getAllUsers()
            .then(users => {
                should(users).be.an.instanceOf(Array).and.have.lengthOf(0)
            })
        })

        it('Getting user by mail', function() {
            return users.getUserByEmail(user.email)
            .then(user => {
                should(user).be.undefined
            })
        })

        it('Trying signin user', function() {
            return users.signin({email : user.email, password : user.password})
            .then(result=> {
                should(result).have.property('status')
                should(result.status).be.equal(false)
                should(result).have.property('message')
                should(result.message).be.equal("Can't find user")
            })
        })

    })

    context('There is no users', function() {

        it('Regirstration without data', function() {
            return users.registration(null)
            .then(result => {
                should(result).have.property('status')
                should(result.status).be.equal(false)
                should(result).have.property('message')
            })
        })

        it('Regirstration user without name', function() {
            return users.registration({email : user.email, password : user.password})
            .then(result => {
                should(result).have.property('status')
                should(result.status).be.equal(false)
                should(result).have.property('message')
            })
        })

        it('Regirstration user', function() {
            return users.registration(user)
            .then(result => {
                should(result).have.property('status')
                should(result.status).be.equal(true)
                should(result).have.property('message')
                should(result).have.property('userid')
            })
        })

        it('Regirstration user again', function() {
            return users.registration(user)
            .then(result => {
                should(result).have.property('status')
                should(result.status).be.equal(false)
                should(result).have.property('message')
            })
        })

        after(function() {
            return users.clearUsers()
        })
    })

    context('There is one user', function() {

        before(function() {
           return users.registration(user)
           .then(result => {
               user._id = result.userid
           })
        })

        it('Getting one user', function() {
            return users.getAllUsers()
            .then(resultUsers => {
                should(resultUsers).be.an.instanceOf(Array).and.have.lengthOf(1)
            })
        })

        it('Getting one user using his email', function() {
            return users.getUserByEmail(user.email)
            .then(resultUser => {
                should(resultUser).have.property("name", user.name)
                should(resultUser).have.property("email", user.email)
                should(resultUser).have.property("password", user.password)
            })
        })

        it('Trying find user using wrong email', function() {
            return users.getUserByEmail("wrong@example.com")
            .then(user => {
                should(user).be.undefined
            })
        })

        after(function() {
            return users.clearUsers()
        })
    })
})
