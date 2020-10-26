const express = require("express");
const mongoose = require("mongoose");
const router = express.Router()
const Post = mongoose.model("Post")
const User = mongoose.model("User")
const requireLogin = require('../middleware/requireLogin')

router.get('/user/:id', requireLogin, async (req, res) => {
    console.log(`id is :: ${req.params.id}`)
    try {
        let user = await User.findOne({ _id: req.params.id }).select('-password')
        console.log(`user is ${user}`)
        posts = await Post.find({ postedBy: req.params.id }).populate("postedBy", "_id name")
        console.log(`post is ${posts}`)
        //await posts.exec()

        res.json({ user, posts })
    } catch (err) {
        res.status(404).json({ error: " User not found" })
    }

})

//If I am going to follow some Other person , so I am sending his/her user id as  params 
router.put('/follow/:id', requireLogin, async (req, res) => {
    console.log(`id is :: ${req.params.id}`)
    const otherUser = await User.findByIdAndUpdate(req.params.id, {
        $push: { followers: req.user._id }
    }, {
        new: true
    })
    console.log(`user is :: ${otherUser}`)
    const myProfile = await User.findByIdAndUpdate(req.user._id, {
        $push: { following: req.params.id }
    }, {
        new: true
    })
    res.json({
        otherUser,
        myProfile,
        msg: " succesfully follow"
    })
})

router.put('/unfollow/:id', requireLogin, async (req, res) => {
    console.log(`id is :: ${req.params.id}`)
    const otherUser = await User.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    })
    console.log(`user is :: ${otherUser}`)
    const myProfile = await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: req.params.id }
    }, {
        new: true
    })
    res.json({
        otherUser,
        myProfile,
        msg: " succesfully follow"
    })
})

router.put('/UpdateProfilePic', requireLogin, async (req, res) => {
    try {
        const { photo } = req.body
        console.log(`req.body is:: ${req.body}`)
        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: { photo }
        }, {
            new: true
        })
        res.json(user)
    } catch (err) {
        res.status(422).json({ error: "pic is not posted" })
    }

})

module.exports = router