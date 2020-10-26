const express = require("express");
const mongoose = require("mongoose");
const router = express.Router()
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const requireLogin = require('../middleware/requireLogin')

router.get('/protected', requireLogin, (req, res) => {
    res.send("logged in inside protected url")
})
// post by async await
router.post('/signup', async (req, res) => {
    console.log("inside ")
    const { name, email, password, photo } = req.body
    console.log(`req.body is :: ${JSON.stringify(req.body)}`)
    if (!name || !email || !password) {
        res.status(422).json({
            error: "please add all the fields"
        })
    }
    try {
        const savedUser = await User.findOne({ email: email })
        if (savedUser) {
            return res.status(422).json({
                error: "already present"
            })
        }
    } catch (err) {
        console.log(err)
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        req.body.password = hashedPassword
    } catch (err) {
        console.log(err)
    }
    const user = new User(req.body)
    try {
        const newUser = await user.save()
        res.status(201).json({
            newUser,
            message: "successfully signed Up"
        });
        console.log("saved")
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

router.post('/signin', async (req, res) => {
    console.log(req.headers)
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(422).json({
            error: "Please fill email or password",
        })
    }
    const savedUser = await User.findOne({ email: email })
    if (!savedUser) {
        return res.status(422).json({
            error: "Email is not present",
        })
    }
    const doMatch = await bcrypt.compare(password, savedUser.password)
    if (doMatch) {
        // res.json({
        //     msg: "Successfully Loggedin"
        // })
        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
        res.json({
            token: token,
            message: "Successfully Loggedin",
            savedUser
        })
    } else {
        return res.status(422).json({
            error: "Invalid Email or Password"
        })
    }
})


module.exports = router