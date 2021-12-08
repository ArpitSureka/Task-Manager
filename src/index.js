const express = require('express')
require('./db/mongoose')
const UserRouter = require('./routers/users')
const TaskRouter = require('./routers/tasks')

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(UserRouter)
app.use(TaskRouter)

app.listen(PORT,()=>{
    console.log('server running on ' + PORT)
})