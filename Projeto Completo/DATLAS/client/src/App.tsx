import { useEffect } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css';
import MapView from './components/Map/MapView.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './components/Home/Home.tsx';
import QuemSomosComponent from './components/QuemSomos/QuemSomosComponent.tsx';

function App() {
  useEffect(()=> {
    fetch('/api/hello')
    .then(res=> res.json())
    .then(data => console.log(data.message))
  })

  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path='/mapa' element={<MapView />} />
            <Route path='/' element={<Home />} />
            <Route path='/quem-somos' element={<QuemSomosComponent />} />
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
