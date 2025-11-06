import { useEffect } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css';
import MapView from './components/Map/MapView.tsx';

function App() {
  useEffect(()=> {
    fetch('/api/hello')
    .then(res=> res.json())
    .then(data => console.log(data.message))
  })

  return (
    <>
      <MapView />
    </>
  )
}

export default App
