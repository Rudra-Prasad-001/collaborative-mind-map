const mongoose = require('mongoose')

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.URI)
      console.log('DB connected host:', conn.connection.host)
    } catch(error) {
        console.log("DB connection error: ", error)
        process.exit(1)
    }
}

module.exports = connectDB