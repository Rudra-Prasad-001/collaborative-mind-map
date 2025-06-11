const db = require('../model/user')
const bcrypt = require('bcrypt')

const handelRegister = async(req,res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email 

    if(!username || !password || !email) {
        res.json({msg: `Please enter valid details`})
        return
    }

    const duplicateUserName =  await db.findOne({username: username}).exec()
    const duplicateEmail = await db.findOne({email: email}).exec()

    if(duplicateUserName) {
        res.status(409).send("This username already exist, Please select another username")
        return 
    }

    if(duplicateEmail) {
        res.status(409).send("This email already exist. Please try with another email or login!")
        return
    }


    const hashedPassword = await bcrypt.hash(password , 10)

    try{
        const data = new db({
        username: username,
        email: email,
        password: hashedPassword
      })
      await data.save()
      res.status(201).json({msg: `${username} created!`})
    } catch(error) {
        res.status(500).json({error: `${error}`})
    }

   
}

module.exports = handelRegister

