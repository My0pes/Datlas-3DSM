import { useEffect } from 'react'
import './App.css'

function App() {
  useEffect(()=> {
    fetch('/api/hello')
    .then(res=> res.json())
    .then(data => console.log(data.message))
  })

  return (
    <>
      {/* PROJETO */}
    </>
  )
}

export default App
