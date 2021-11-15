const should = require('should')
const users = require('../../lib/users')



describe('Users and ideas', function() {
    before(function() {
        // очистка базы данных
        return users.setup()
        .then(() => {
          return users.clearUsers()
        })
    })

    context('There is no users', function() {
        it('Getting an error when searching for a user', function() {
            return users.getAllUsers()
            .then(users => {
                users.should.be.an.instanceOf(Array).and.have.lengthOf(0)
            })
        })

    })

    context('There is one user', function() {
        const user = {
            name : "Alex",
            email : "alexf1989@gmail.com",
            password : "Pitbuli32"
        }

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

        it('Getting error using wrong email', function() {
            return users.getUserByEmail("wrong@example.com")
            .then(user => {
                should(user).be.undefined
            })
        })

        after(function() {
            return users.clearUsers()
            .then(() => {
                users.getAllUsers()
                .then(mass => {
                    console.log("Users after clean", mass)
                })
            })
        })
    })
})