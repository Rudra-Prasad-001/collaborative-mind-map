import { ReactFlow, Background, Controls } from '@xyflow/react';
//Without importing this style.css the react flow will not work
import '@xyflow/react/dist/style.css';

export default function MindMap() {
    return(
        <div style={{height :'100vh'}}>
            <ReactFlow>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    )
}


