const express = require("express");
const mongoose = require("mongoose");
const router = express.Router()
const Post = mongoose.model("Post")
const requireLogin = require('../middleware/requireLogin')



router.get('/allPosts', async (req, res) => {
    try {
        const posts = await Post.find().populate('postedBy', "_id name").populate('comments.postedBy', "_id name")
        res.json({
            posts
        })
    } catch (ex) {
        console.log(ex)
    }
})

router.get('/followedUserPost', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find({ $or: [{ postedBy: { $in: req.user.following } }, { postedBy: { $eq: req.user._id } }] })
            .populate("postedBy", "_id name").populate('comments.postedBy', "_id name")
        res.json({
            posts
        })
    } catch (ex) {
        console.log(ex)
    }
})

router.post('/createPost', requireLogin, async (req, res) => {
    console.log(req.body)
    const { title, body, photo } = req.body
    console.log(req.body)
    if (!title || !body) {
        return res.status(422).json({
            error: "please add title and body"
        })
    }
    console.log(`req.user is ${req.user}`)
    const post = new Post(req.body)
    post.postedBy = req.user
    post.postedBy.password = ""
    const newPost = await post.save()
    res.status(201).json({
        newPost,
        message: "successfully posted"
    });
})

router.get('/myPost', requireLogin, (req, res) => {

    Post.find({ postedBy: req.user._id }).populate('postedBy', "_id name").then((myPost) => {
        res.json({
            myPost
        })
    }).catch((err) => {
        console.log(err)
    })
})

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    }).populate('postedBy', "_id name").populate('comments.postedBy', "_id name").exec((err, result) => {
        if (err) {
            return res.status(422).json({
                error: err
            })
        } else {
            res.json(
                result
            )
        }
    })
})

router.put('/dislike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    }).populate('postedBy', "_id name").populate('comments.postedBy', "_id name").exec((err, result) => {
        if (err) {
            return res.json({
                error: err
            })
        } else {
            res.json(
                result
            )
        }
    })
})

router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    }).populate('comments.postedBy', "_id name").populate('postedBy', "_id name").exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        } else {
            res.json(result)
        }
    })
})

router.delete('/delete/:postId', requireLogin, (req, res) => {
    console.log(req.params.postId)
    Post.findOne({ _id: req.params.postId })
        //.populate("postedBy", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({ error: err })
            } if (post.postedBy._id.toString() === req.user._id.toString()) {
                post.remove().then((result) => {
                    console.log(result)
                    res.json({
                        result,
                        message: "successfully deleted"
                    })
                })
            }
        })
})

module.exports = router