const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./tasks')

const UserSchema = new mongoose.Schema({
    name :{
        type : String,
        required : true,
        trim : true,
    },
    email : {
        type: String,
        unique : true,
        required : true,
        trim : true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain password')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value<0) {
                throw new Error('Age cannot be negative')
            }
        } 
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    avatars : {
        type : Buffer
    }
},{
    timestamps : true
})

UserSchema.virtual('tasks',{
    ref : 'Tasks',
    localField : '_id',
    foreignField : 'owner'
})

UserSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatars

    return userObject
}

UserSchema.methods.generateAuthTokens = async function () {

    const user = this
    const token = jwt.sign({_id : user._id.toString() },process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

UserSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('email Unable to Login!')
    }

    const isMatch = await bcryptjs.compare(password, user.password)

    if(!isMatch){
        throw new Error('pass Unable to Login!')
    }

    return user
}

UserSchema.pre('save',async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcryptjs.hash(user.password,8)
    }

    next()
})

// delete user when user is removed
UserSchema.pre('remove', async function (next) {
    const user = this

    await Tasks.deleteMany({ owner : this._id })

    next()
})


const User = mongoose.model('User',UserSchema)

module.exports = User