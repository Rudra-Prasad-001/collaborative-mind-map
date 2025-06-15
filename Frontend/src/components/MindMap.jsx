import { useCallback, useState } from 'react';
import { 
    ReactFlow,
    Background,
    Controls,
    applyEdgeChanges,
    applyNodeChanges
} from '@xyflow/react';
//Without importing this style.css the react flow will not work
import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: '1',
    position: {x: 0, y: 0},
    data: {label: 'First node'}
    
 },
 {
    id: '2',
    position: {x:100, y: 110},
    data: {label: 'second node'}
 }
]

const initialEdges = [
    {
        id: '1-2',
        source: '1',
        target: '2',
        label: 'Edge'
    }
]

export default function MindMap() {
    const [nodes, setNodes] = useState(initialNodes)
    const [edges, setEdges] = useState(initialEdges)

    //useCallback optimize the performance by not recreating the fn in every renders (it returns the fn not return value)
    
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
    return(
        <div style={{height :'100vh'}}>
            <ReactFlow
            nodes={nodes} 
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}


