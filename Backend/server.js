const express = require('express')

const dotenv = require('dotenv').config()

const connectDB = require('./config/db')

connectDB()

const app = express()

const PORT = process.env.PORT || 3000

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