import { useCallback, useState } from 'react';
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

const initialNodes = [
  {
    id: '1',
    position: {x: 0, y: 0},
    data: {label: 'First node'}       
  }, 
{
    id: '2',
    position: {x:70, y: 60},
    data: {label: 'second node'} 
}
]

const initialEdges = [
    {
        id: '1-2',
        source: '1',
        target: '2',
        label: 'Loves'
    }
]

// Node ID counter
let nodeId = 3;

export default function MindMap() {
    const [nodes, setNodes] = useState(initialNodes)
    const [edges, setEdges] = useState(initialEdges)
    // ADD THESE: State for editing
    const [selectedNode, setSelectedNode] = useState(null)
    const [editingLabel, setEditingLabel] = useState('')

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

    // ADD THIS: Handle node double-click for editing
    const onNodeDoubleClick = useCallback((event, node) => {
        console.log("Double-clicked node:", node);
        setSelectedNode(node);
        setEditingLabel(node.data.label);
    }, []);

    // ADD THIS: Update node label
    const updateNodeLabel = useCallback(() => {
        if (!selectedNode || !editingLabel.trim()) return;
        
        setNodes((nds) => 
            nds.map((node) => 
                node.id === selectedNode.id 
                    ? { ...node, data: { ...node.data, label: editingLabel.trim() } }
                    : node
            )
        );
        
        // Close editing panel
        setSelectedNode(null);
        setEditingLabel('');
    }, [selectedNode, editingLabel]);

    // ADD THIS: Handle Enter key to save
    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter') {
            updateNodeLabel();
        } else if (event.key === 'Escape') {
            setSelectedNode(null);
            setEditingLabel('');
        }
    }, [updateNodeLabel]);

    // Function to add new node
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

    // Handle canvas click to add node
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

    return(
        <div className="mindmap-container">
            <div className="mindmap-controls">
                <button
                    onClick={addNewNode}
                    className="add-node-btn"
                >
                    ➕ Add Node
                </button>
                <div className="node-counter">
                    Nodes: {nodes.length} | Edges: {edges.length}
                </div>
            </div>

            {/* ADD THIS: Editing Sidebar */}
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
            onNodeDoubleClick={onNodeDoubleClick}  // ADD THIS LINE
            fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}