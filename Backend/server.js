const express = require('express')

const dotenv = require('dotenv').config()

const connectDB = require('./config/db')

connectDB()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())

app.use('/api', require('./routes/api/register'))

app.use('/api', require('./routes/api/login'))

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