const express = require('express')
const router = express.Router()
const registerController = require('../../controller/handelRegister')

router.post('/register', registerController)

module.exports = router
