const express = require('express')
const User = require('../models/users')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const {sendWelcomeEmail,sendGoodbyeEmail} = require('../emails/account')
const router = new express.Router()
const multer = require('multer')

//signup
router.post('/users', async (req,res)=>{
    var user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthTokens()
        res.status(201).send({user,token})
    } catch(error) {
        console.log(error)
        res.status(400).send(error)
    }

})

//login 
router.post('/users/login' , async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthTokens()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//getprofile
router.get('/users/me', auth , async (req,res)=>{
    res.send(req.user)
})

// DELETE Profile 
router.delete('/users/me', auth, async (req,res)=>{
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.status(201).send(req.user)
    } catch(error) {
        console.log(error)
        res.status(500).send()
    }
})

// update user profile 
router.patch('/users/me', auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','password','email','age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('Invalid Updates')
    }

    try {
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.status(201).send(req.user)
    } catch(error) {
        res.send(500).send(error)
    }
})

// logout
router.post('/users/logout',auth,async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        }) 
        await req.user.save()
        res.send()
    } catch (error){
        res.status(500).send()
    }
})

// logout all 
router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(error){
        res.status(500).send()
    }
})

const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar') , async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({ width : 250, height:250 }).png().toBuffer()
    req.user.avatars = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatars = undefined
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error : error.message})
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatars){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatars)
    }catch(error){
        console.log(error)
        res.status(400).send()
    }
})

module.exports = router
