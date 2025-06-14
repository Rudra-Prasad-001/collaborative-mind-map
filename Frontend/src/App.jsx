import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MindMap from './components/MindMap.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <p>working</p>
    <MindMap />
    </>
  )
}

export default App
