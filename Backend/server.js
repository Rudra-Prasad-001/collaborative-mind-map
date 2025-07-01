const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const dotenv = require('dotenv').config()
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')

connectDB()

const app = express()
const PORT = process.env.PORT || 3000

// Create HTTP server
const server = http.createServer(app)

// Setup Socket.IO with CORS configuration
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
})

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api', require('./routes/api/register'))
app.use('/api', require('./routes/api/login'))
app.use('/api', require('./routes/api/refresh'))
app.use('/api', require('./routes/api/mindmaps'))

app.get('/', (req,res) => {
    res.send("Socket.IO Server Running! 🚀")
})

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`)

    // Handle user joining a room (mindmap session)
    socket.on('join-room', (roomId, userInfo) => {
        console.log(`👤 User ${socket.id} joining room: ${roomId}`)
        
        // Leave any previous rooms
        Array.from(socket.rooms).forEach(room => {
            if (room !== socket.id) {
                socket.leave(room)
            }
        })
        
        // Join the new room
        socket.join(roomId)
        
        // Store user info in socket
        socket.roomId = roomId
        socket.userInfo = userInfo || { username: 'Anonymous' }
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
            userId: socket.id,
            userInfo: socket.userInfo,
            timestamp: new Date()
        })
        
        // Send current room info to user
        const roomSockets = io.sockets.adapter.rooms.get(roomId)
        const roomSize = roomSockets ? roomSockets.size : 1
        
        socket.emit('room-joined', {
            roomId: roomId,
            connectedUsers: roomSize,
            message: `Joined room: ${roomId}`
        })
        
        console.log(`📊 Room ${roomId} now has ${roomSize} users`)
    })

    // Handle node addition events
    socket.on('add-node', (nodeData) => {
        console.log(`➕ User ${socket.id} added node:`, nodeData.id)
        
        // Broadcast to all users in the same room except sender
        if (socket.roomId) {
            socket.to(socket.roomId).emit('node-added', {
                node: nodeData,
                userId: socket.id,
                userInfo: socket.userInfo,
                timestamp: new Date()
            })
        }
    })

    // Handle node updates (position, label changes)
    socket.on('update-node', (nodeData) => {
        console.log(`🔄 User ${socket.id} updated node:`, nodeData.id)
        
        if (socket.roomId) {
            socket.to(socket.roomId).emit('node-updated', {
                node: nodeData,
                userId: socket.id,
                userInfo: socket.userInfo,
                timestamp: new Date()
            })
        }
    })

    // Handle node deletion
    socket.on('delete-node', (nodeId) => {
        console.log(`❌ User ${socket.id} deleted node:`, nodeId)
        
        if (socket.roomId) {
            socket.to(socket.roomId).emit('node-deleted', {
                nodeId: nodeId,
                userId: socket.id,
                userInfo: socket.userInfo,
                timestamp: new Date()
            })
        }
    })

    // Handle edge connections
    socket.on('add-edge', (edgeData) => {
        console.log(`🔗 User ${socket.id} added edge:`, edgeData.id)
        
        if (socket.roomId) {
            socket.to(socket.roomId).emit('edge-added', {
                edge: edgeData,
                userId: socket.id,
                userInfo: socket.userInfo,
                timestamp: new Date()
            })
        }
    })

    // Handle edge deletion
    socket.on('delete-edge', (edgeId) => {
        console.log(`🔗❌ User ${socket.id} deleted edge:`, edgeId)
        
        if (socket.roomId) {
            socket.to(socket.roomId).emit('edge-deleted', {
                edgeId: edgeId,
                userId: socket.id,
                userInfo: socket.userInfo,
                timestamp: new Date()
            })
        }
    })

    // Handle node movement (drag events)
    socket.on('move-node', (nodeData) => {
        // Throttle movement events to avoid spam
        if (socket.roomId) {
            socket.to(socket.roomId).emit('node-moved', {
                nodeId: nodeData.id,
                position: nodeData.position,
                userId: socket.id,
                timestamp: new Date()
            })
        }
    })

    // Handle cursor position sharing (optional - for showing other users' cursors)
    socket.on('cursor-move', (cursorData) => {
        if (socket.roomId) {
            socket.to(socket.roomId).emit('cursor-moved', {
                userId: socket.id,
                userInfo: socket.userInfo,
                position: cursorData.position,
                timestamp: new Date()
            })
        }
    })

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`🔌❌ User disconnected: ${socket.id}`)
        
        if (socket.roomId) {
            // Notify others in the room
            socket.to(socket.roomId).emit('user-left', {
                userId: socket.id,
                userInfo: socket.userInfo,
                timestamp: new Date()
            })
            
            // Log room status
            const roomSockets = io.sockets.adapter.rooms.get(socket.roomId)
            const roomSize = roomSockets ? roomSockets.size : 0
            console.log(`📊 Room ${socket.roomId} now has ${roomSize} users`)
        }
    })

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error)
    })
})

// Start server using HTTP server (not Express app directly)
server.listen(PORT, (error) => {
    if(error){
        console.log("Error: ", error)
    } else {
        console.log(`🚀 Server with Socket.IO running on port: ${PORT}`)
        console.log(`🔌 Socket.IO ready for connections`)
    }
})