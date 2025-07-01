import { useCallback, useState, useEffect } from 'react';
import {     
    ReactFlow,
    Background,
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './MindMap.css';
import { mindMapAPI, authAPI } from '../services/api';

// Default initial data (fallback)
const defaultNodes = [
  {
    id: '1',
    position: {x: 0, y: 0},
    data: {label: 'Welcome to MindMap'}       
  }
];

const defaultEdges = [];

// Node ID counter
let nodeId = 2;

export default function MindMap() {
    const [nodes, setNodes] = useState(defaultNodes);
    const [edges, setEdges] = useState(defaultEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [editingLabel, setEditingLabel] = useState('');
    
    // NEW: Backend integration state
    const [currentMindMapId, setCurrentMindMapId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

    // NEW: Load mindmap on component mount
    useEffect(() => {
        loadMindMap();
    }, []);

    // NEW: Auto-save functionality
    useEffect(() => {
        if (!autoSaveEnabled || !currentMindMapId) return;

        const autoSaveTimer = setTimeout(() => {
            saveMindMap();
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(autoSaveTimer);
    }, [nodes, edges, autoSaveEnabled, currentMindMapId]);

    // NEW: Load mindmap from backend
    const loadMindMap = async () => {
        try {
            setIsLoading(true);
            
            // Check if user is authenticated
            if (!authAPI.isAuthenticated()) {
                console.log('User not authenticated, using default mindmap');
                setIsLoading(false);
                return;
            }

            // Try to get user's mindmaps
            const response = await mindMapAPI.getUserMindMaps();
            
            if (response.success && response.data.length > 0) {
                // Load the most recent mindmap
                const latestMindMap = response.data[0];
                setCurrentMindMapId(latestMindMap._id);
                
                // Convert backend format to React-Flow format
                const loadedNodes = latestMindMap.nodes.map(node => ({
                    id: node.id,
                    position: node.position,
                    data: { label: node.label }
                }));

                const loadedEdges = latestMindMap.edges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label || ''
                }));

                setNodes(loadedNodes);
                setEdges(loadedEdges);
                
                // Update node counter
                const maxId = Math.max(
                    ...loadedNodes.map(n => parseInt(n.id) || 0),
                    1
                );
                nodeId = maxId + 1;
                
                setLastSaved(new Date().toLocaleTimeString());
                console.log('Mindmap loaded successfully:', latestMindMap.title);
            } else {
                // No existing mindmaps, create a new one
                await createNewMindMap();
            }
        } catch (error) {
            console.error('Error loading mindmap:', error);
            // Continue with default data if loading fails
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Create new mindmap
    const createNewMindMap = async () => {
        try {
            if (!authAPI.isAuthenticated()) {
                console.log('Cannot create mindmap: user not authenticated');
                return;
            }

            const mindMapData = {
                title: 'New Mind Map',
                nodes: nodes.map(node => ({
                    id: node.id,
                    label: node.data.label,
                    position: node.position
                })),
                edges: edges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label || ''
                }))
            };

            const response = await mindMapAPI.create(mindMapData);
            
            if (response.success) {
                setCurrentMindMapId(response.data._id);
                setLastSaved(new Date().toLocaleTimeString());
                console.log('New mindmap created:', response.data._id);
            }
        } catch (error) {
            console.error('Error creating mindmap:', error);
        }
    };

    // NEW: Save mindmap to backend
    const saveMindMap = async () => {
        try {
            if (!authAPI.isAuthenticated()) {
                console.log('Cannot save: user not authenticated');
                return;
            }

            setIsSaving(true);

            const mindMapData = {
                title: 'My Mind Map', // You can make this editable later
                nodes: nodes.map(node => ({
                    id: node.id,
                    label: node.data.label,
                    position: node.position
                })),
                edges: edges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label || ''
                }))
            };

            let response;
            if (currentMindMapId) {
                // Update existing mindmap
                response = await mindMapAPI.update(currentMindMapId, mindMapData);
            } else {
                // Create new mindmap
                response = await mindMapAPI.create(mindMapData);
                setCurrentMindMapId(response.data._id);
            }

            if (response.success) {
                setLastSaved(new Date().toLocaleTimeString());
                console.log('Mindmap saved successfully');
            }
        } catch (error) {
            console.error('Error saving mindmap:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // NEW: Manual save button
    const handleManualSave = () => {
        saveMindMap();
    };

    const onNodesChange = useCallback(
        (userActions) => {
            setNodes(
                (nds) => applyNodeChanges(userActions,nds)
            )
        }, []
    )
    
    const onEdgesChange = useCallback(
        (userActions) => {
            setEdges(
                (eds) => applyEdgeChanges(userActions, eds)
            )
        }, []
    )

    const onNodeDragStop = useCallback((e,nd) => {
        console.log("Node dragged: ", nd)
        setNodes((prev)=> {
           return prev.map((n) => n.id === nd.id? nd : n)
        })
    }, [])

    const onConnect = useCallback(
        (params) => {
            console.log("Connecting nodes:", params);
            setEdges((eds) => addEdge(params, eds));
        },
        []
    );

    const onNodeDoubleClick = useCallback((event, node) => {
        console.log("Double-clicked node:", node);
        setSelectedNode(node);
        setEditingLabel(node.data.label);
    }, []);

    const updateNodeLabel = useCallback(() => {
        if (!selectedNode || !editingLabel.trim()) return;
        
        setNodes((nds) => 
            nds.map((node) => 
                node.id === selectedNode.id 
                    ? { ...node, data: { ...node.data, label: editingLabel.trim() } }
                    : node
            )
        );
        
        setSelectedNode(null);
        setEditingLabel('');
    }, [selectedNode, editingLabel]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter') {
            updateNodeLabel();
        } else if (event.key === 'Escape') {
            setSelectedNode(null);
            setEditingLabel('');
        }
    }, [updateNodeLabel]);

    const addNewNode = useCallback(() => {
        const newNode = {
            id: `${nodeId}`,
            position: { 
                x: 160,
                y: 110
            },
            data: { label: `Node ${nodeId}` }
        };
        
        setNodes((nds) => [...nds, newNode]);
        nodeId++;
    }, []);

    const onPaneClick = useCallback((event) => {
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        
        const position = {
            x: event.clientX - reactFlowBounds.left - 75,
            y: event.clientY - reactFlowBounds.top - 25,
        };

        const newNode = {
            id: `${nodeId}`,
            position,
            data: { label: `Node ${nodeId}` }
        };

        setNodes((nds) => [...nds, newNode]);
        nodeId++;
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div className="mindmap-container">
                <div className="loading-state">
                    <p>Loading your mind map...</p>
                </div>
            </div>
        );
    }

    return(
        <div className="mindmap-container">
            <div className="mindmap-controls">
                <button
                    onClick={addNewNode}
                    className="add-node-btn"
                >
                    ➕ Add Node
                </button>
                
                {/* NEW: Save controls */}
                <button
                    onClick={handleManualSave}
                    className="save-btn"
                    disabled={isSaving}
                >
                    {isSaving ? '💾 Saving...' : '💾 Save'}
                </button>
                
                <label className="auto-save-toggle">
                    <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    />
                    Auto-save
                </label>

                <div className="node-counter">
                    Nodes: {nodes.length} | Edges: {edges.length}
                    {lastSaved && (
                        <span className="last-saved">
                            | Last saved: {lastSaved}
                        </span>
                    )}
                </div>

                {/* NEW: Connection status */}
                <div className="connection-status">
                    {authAPI.isAuthenticated() ? (
                        <span className="status-connected">🟢 Connected</span>
                    ) : (
                        <span className="status-offline">🔴 Offline Mode</span>
                    )}
                </div>
            </div>

            {selectedNode && (
                <div className="edit-sidebar">
                    <h3>Edit Node</h3>
                    <div className="edit-form">
                        <label>Node Label:</label>
                        <input
                            type="text"
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Enter node label"
                            autoFocus
                        />
                        <div className="edit-buttons">
                            <button 
                                onClick={updateNodeLabel}
                                className="save-btn"
                            >
                                Save
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedNode(null);
                                    setEditingLabel('');
                                }}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                        <small>Tip: Double-click any node to edit</small>
                    </div>
                </div>
            )}

            <ReactFlow
            nodes={nodes} 
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onPaneClick={onPaneClick}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}