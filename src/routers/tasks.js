const express = require('express')
const Tasks = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()

// get all tasks of user
router.get('/tasks',auth, async (req,res)=>{
    const sort = {}  
    const match = {}

    if(req.query.completed){
        match.completed = req.query.completed
    }
    
    if(req.query.sort){
        const parts = req.query.sort.split('_')
        sort[parts[0]] = (parts[1] == 'desc' ? -1 : 1)
    }

    try {
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        })
        res.status(201).send(req.user.tasks)
    } catch(error) {
        console.log(error)
        res.status(500).send()
    }

})

// add task
router.post('/tasks', auth, async (req,res)=>{
    var task = new Tasks({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch(error) {
        res.status(400).send(error)
    }
})

// get task using task id
router.get('/tasks/:id', auth , async (req,res)=>{
    var _id = req.params.id

    try {
       const task =  await Tasks.findOne({_id, owner : req.user._id})
       if(!task){
           return res.status(404).send()
       }
       res.status(201).send(task)
    } catch(error) {
        res.status(500).send(error)
    }
})

// delete tasks
router.delete('/tasks/:id', auth, async (req,res)=>{
    var id = req.params.id

    try {
       const task =  await Tasks.findOneAndDelete({_id : id,owner : req.user._id})
       if(!task){
           return res.status(404).send()
       }
       res.status(201).send(task)
    } catch(error) {
        console.log(error)
        res.status(500).send()
    }
})

// update task
router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send('Invalid Updates')
    }

    try {
        const task =  await Tasks.findOne({ _id : req.params.id, owner : req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=>{
            task[updates] = req.body[update]
        })
        await task.save()  
        res.status(201).send(task)
    } catch(error) {
        res.send(500).send(error)
    }
})

module.exports = router