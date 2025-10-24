import { MapContainer, TileLayer, useMap } from "react-leaflet";
import styles from './Map.module.css'
import { useState, useEffect} from "react";
import { MarkerMap } from "../MarkerMap/MarkerMap";
import { BuscarEndereco } from "../BuscarEndereco/BuscarEndereco";

type PropsZoom = {
	zoom: number
	center: {lat: number, lng:number}
}

function AtualizarZoom ({zoom, center}: PropsZoom){
	const map = useMap()			

	useEffect(() => {
		map.setView(center, zoom) 	
	}, [center ,zoom])

	return null
}

export default function MapView() {
	const [position, setPosition] = useState<{lat: number, lng: number}>({lat:-15.7833, lng: -55.1667});

	const [coordenadas, setCoordenadas] = useState<{lat: number, lng:number} | null>(null)
	const [zoomPosition, setZoomPosition] = useState<number>(5.3)
	const [userInteragiu, setUserInteragiu] = useState(false)

	
	const recebeCoord = (pos: {lat: number, lng: number}) => {
		setPosition(pos)            
		setCoordenadas(pos)         
		setUserInteragiu(true)      
	}

	useEffect(() => {
		if(userInteragiu){ 
			setZoomPosition(8)
		}

		if(coordenadas){            
			setPosition(coordenadas) 	
			setZoomPosition(14)	
		}
	}, [position, userInteragiu, coordenadas])

	// Ajustando as coordenadas de zoom para deixar espaço para o dashboard
	const centerSpaceDashboard = {
		lat: position.lat - 0.018,
		lng: position.lng
	}
	return (
		<>
			<div className={styles.map}>
                <MapContainer center={position} zoom={5.3} style={{ height: "100vh", width: '100vw' }}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					 <MarkerMap coordenadas={coordenadas} onCoordChange={recebeCoord}/>
					<AtualizarZoom zoom={zoomPosition} center={centerSpaceDashboard}/>
				</MapContainer>
            </div>
			<BuscarEndereco onSelecionar={(coords) => setCoordenadas(coords)}/>
		</>
	);
}
