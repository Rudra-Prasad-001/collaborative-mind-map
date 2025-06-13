const db = require('../model/user')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()


const handelRefreshToken = async (req,res) => {

    const token = req.cookies.refreshToken
    if(!token) {
        return res.status(401).json({msg: 'Refresh Token not found'})
    }
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

        const user = await db.findById(decoded.id)

        if(!user) {
            return res.status(404).json({msg: 'User not exist'})
        }

        const payload = {
            id: user._id,
            username: user.username
        }

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})

        res.status(200).json({
            accessToken: accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    }catch(error) {
        res.status(403).json({error: 'Invalid or expired Refresh Token'})
    }
    
}

module.exports = handelRefreshToken