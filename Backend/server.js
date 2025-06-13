const express = require('express')

const dotenv = require('dotenv').config()

const cookieParser = require('cookie-parser')

const connectDB = require('./config/db')

connectDB()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())

app.use(cookieParser())

app.use('/api', require('./routes/api/register'))

app.use('/api', require('./routes/api/login'))

app.use('/api', require('./routes/api/profile'))

app.use('/api', require('./routes/api/refresh'))


app.get('/', (req,res) => {
    res.send("hey")
})

app.listen(PORT, (error) => {
    if(error){
        console.log("Error: ", error)
    } else {
        console.log("Server is running on port:" ,  PORT)
    }
})