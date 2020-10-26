const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const mongoose = require("mongoose");
const User = mongoose.model("User")

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in" })
    }
    //authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Zjg1M2JjMWVkNWQ1ZjBiYzQ5NDkyYTIiLCJpYXQiOjE2MDI1NzIzMjd9.o30JXb1CjYLKfNZz9KoIs_pB8SkcKxghxbQPsdmctTU',
    const token = authorization.replace("Bearer ", "")
        // console.log(`JWT_SECRET is :: ${JWT_SECRET}`)
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: "You must be logged in" })
        }
        const jsonpay = JSON.stringify(payload)
            //  console.log(`payload is :: ${jsonpay}`)

        const { _id } = payload
        User.findById(_id).then((userData) => {
            req.user = userData
            next()
                //    console.log(`req.user is ${req.user}`)
        })


    })

}