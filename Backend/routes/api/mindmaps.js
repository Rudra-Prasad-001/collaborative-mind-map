const express = require('express')
const router = express.Router()
const MindMap = require('../../model/mindmap')
const verifyToken = require('../../middleware/verifyToken')

// POST /api/mindmaps - Create new mindmap
router.post('/mindmaps', verifyToken, async (req, res) => {
    try {
        const { title, nodes = [], edges = [] } = req.body
        
        const newMindMap = new MindMap({
            title: title || 'Untitled Mind Map',
            ownerId: req.user.id,
            nodes,
            edges
        })

        const savedMindMap = await newMindMap.save()
        
        res.status(201).json({
            success: true,
            message: 'Mind map created successfully',
            data: savedMindMap
        })
    } catch (error) {
        console.error('Error creating mindmap:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to create mind map',
            error: error.message
        })
    }
})

// GET /api/mindmaps/:id - Get specific mindmap
router.get('/mindmaps/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        
        const mindMap = await MindMap.findById(id).populate('ownerId', 'username email')
        
        if (!mindMap) {
            return res.status(404).json({
                success: false,
                message: 'Mind map not found'
            })
        }

        // Check if user owns this mindmap or has access (for now, only owner)
        if (mindMap.ownerId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own mind maps'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Mind map retrieved successfully',
            data: mindMap
        })
    } catch (error) {
        console.error('Error fetching mindmap:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mind map',
            error: error.message
        })
    }
})

// PUT /api/mindmaps/:id - Update existing mindmap
router.put('/mindmaps/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        const { title, nodes, edges } = req.body

        // Find the mindmap first
        const mindMap = await MindMap.findById(id)
        
        if (!mindMap) {
            return res.status(404).json({
                success: false,
                message: 'Mind map not found'
            })
        }

        // Check ownership
        if (mindMap.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own mind maps'
            })
        }

        // Update fields if provided
        const updateData = {}
        if (title !== undefined) updateData.title = title
        if (nodes !== undefined) updateData.nodes = nodes
        if (edges !== undefined) updateData.edges = edges

        const updatedMindMap = await MindMap.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('ownerId', 'username email')

        res.status(200).json({
            success: true,
            message: 'Mind map updated successfully',
            data: updatedMindMap
        })
    } catch (error) {
        console.error('Error updating mindmap:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update mind map',
            error: error.message
        })
    }
})

// GET /api/mindmaps - Get all mindmaps for logged-in user (bonus route)
router.get('/mindmaps', verifyToken, async (req, res) => {
    try {
        const mindMaps = await MindMap.find({ ownerId: req.user.id })
            .populate('ownerId', 'username email')
            .sort({ updatedAt: -1 })

        res.status(200).json({
            success: true,
            message: 'Mind maps retrieved successfully',
            count: mindMaps.length,
            data: mindMaps
        })
    } catch (error) {
        console.error('Error fetching mindmaps:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mind maps',
            error: error.message
        })
    }
})

module.exports = router