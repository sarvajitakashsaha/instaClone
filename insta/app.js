const express = require("express");
const mongoose = require('mongoose')
const app = express()
const { MONGOURI } = require('./keys')

// connection to mongo
mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.on('connected', () => {
    console.log("db connected ")
})
mongoose.connection.on('error', (err) => {
    console.log(err)
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./route/auth'))
app.use(require('./route/user'))
app.use(require('./route/postRoute'))





//when req comes it go to middleWare first , after verifing it will go to router part
// const customMiddleware = (req,res,next) =>{
//     console.log('middlewire')
//     next()
// }
// app.use(customMiddleware)

// app.get('/',(req,res)=>{
//     res.send("hello")
// })



app.listen(3002, () => {
    console.log("listening");
});