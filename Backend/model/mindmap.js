const mongoose = require('mongoose')

const mindMapSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Untitled Mind Map'
    },
    
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    nodes: [{
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        position: {
            x: {
                type: Number,
                required: true
            },
            y: {
                type: Number,
                required: true
            }
        }
    }],
    
    edges: [{
        id: {
            type: String,
            required: true
        },
        source: {
            type: String,
            required: true
        },
        target: {
            type: String,
            required: true
        },
        label: {
            type: String,
            default: ''
        }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt fields
})

const MindMap = mongoose.model('MindMap', mindMapSchema)

module.exports = MindMap