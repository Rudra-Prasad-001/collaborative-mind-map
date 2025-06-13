const db = require('../model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const handelLogin = async (req,res) => {

    try {

            const username = req.body.username
    const password = req.body.password 

    const isExist = await db.findOne({username: username}).exec()

    if(!isExist) {
        res.status(404).json({msg: `${username} not found`})
        return 
    }
    
    const storedPass = isExist.password
    const isValidPass = await bcrypt.compare(password, storedPass)

    if(!isValidPass) {
        res.status(401).json({msg: `please enter the correct password!`})
        return
    }

    const email = await isExist.email

    const payload = {
        id: isExist._id,
        username: username
    }


    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})

    const refreshToken = jwt.sign({id: isExist._id}, process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'})

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    })

    res.status(200).json({
        msg: 'Login success!',
        accessToken: accessToken,
        user: {
            username: username,
            email: email
        }
    })

    } catch(error) {
        res.status(500).json({
            error: 'oops! an error occured while authenticating'
        })
    }

} 

module.exports = handelLogin