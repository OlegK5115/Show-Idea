const should = require('should')
const users = require('../../lib/users')



describe('Users', function() {
    const user = {
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
                users.should.be.an.instanceOf(Array).and.have.lengthOf(0)
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
                result.should.have.property('status')
                result.status.should.be.equal(false)
                result.should.have.property('message')
                result.message.should.be.equal("Can't find user")
            })
        })

    })

    context('There is no users', function() {

        it('Regirstration without data', function() {
            return users.registration(null)
            .then(result => {
                result.should.have.property('status')
                result.status.should.be.equal(false)
                result.should.have.property('message')
            })
        })

        it('Regirstration user without name', function() {
            return users.registration({email : user.email, password : user.password})
            .then(result => {
                result.should.have.property('status')
                result.status.should.be.equal(false)
                result.should.have.property('message')
            })
        })

        it('Regirstration user', function() {
            return users.registration(user)
            .then(result => {
                result.should.have.property('status')
                result.status.should.be.equal(true)
                result.should.have.property('message')
                result.should.have.property('userid')
            })
        })

        it('Regirstration user again', function() {
            return users.registration(user)
            .then(result => {
                result.should.have.property('status')
                result.status.should.be.equal(false)
                result.should.have.property('message')
            })
        })

        after(function() {
            return users.clearUsers()
        })
    })

    context('There is one user', function() {

        before(function() {
           return users.registration(user)
           .then(id => {
               user.id = id
           })
        })

        it('Getting one user', function() {
            return users.getAllUsers()
            .then(users => {
                users.should.be.an.instanceOf(Array).and.have.lengthOf(1)
            })
        })

        it('Getting one user using his email', function() {
            return users.getUserByEmail(user.email)
            .then(resultUser => {
                resultUser.should.have.property("name", user.name)
                resultUser.should.have.property("email", user.email)
                resultUser.should.have.property("password", user.password)
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
