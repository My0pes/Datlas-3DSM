import { useEffect } from 'react'
import './App.css'
import { Map } from './components/map/Map'

function App() {
  useEffect(()=> {
    fetch('/api/hello')
    .then(res=> res.json())
    .then(data => console.log(data.message))
  })

  return (
    <>
      <Map />
    </>
  )
}

export default App
