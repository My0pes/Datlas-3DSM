import { useEffect } from 'react'
import './App.css'
<<<<<<< HEAD
import 'leaflet/dist/leaflet.css';
import MapView from './components/Map/MapView.tsx';
=======
>>>>>>> origin/Frontend

function App() {
  useEffect(()=> {
    fetch('/api/hello')
    .then(res=> res.json())
    .then(data => console.log(data.message))
  })

  return (
    <>
<<<<<<< HEAD
      <MapView />
=======
      {/* PROJETO */}
>>>>>>> origin/Frontend
    </>
  )
}

export default App
