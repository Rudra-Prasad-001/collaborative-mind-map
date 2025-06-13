const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const verifyToken = (req,res,next) => {
    const auth = req.headers.authorization

    if(!auth) {
        res.status(401).json({msg: 'authorization header not found'})
        return
    }

    if(!auth.startsWith('Bearer')) {
        res.status(401).json({msg: 'invalid token format'})
    }

    //header should look like Bearer token (I neeed the token)
    const token = auth.split(' ')[1]

    if(!token) {
        res.status(401).json({msg: 'access token not found'})
        return
    }

    try{
         const decoded = jwt.verify(token, process.env.JWT_SECRET)
         req.user = decoded
         next()
    } catch(error) {
        res.status(403).json({error: 'Invalid or expired token'})
    }

}

module.exports = verifyToken