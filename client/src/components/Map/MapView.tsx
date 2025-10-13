import { MapContainer, TileLayer } from "react-leaflet";
import styles from './Map.module.css'

export default function MapView() {
	const position: [number, number] = [-15.7833, -55.1667];
	return (
		<>
			<div className={styles.map}>
                <MapContainer center={position} zoom={5.3} style={{ height: "100vh", width: '100vw' }}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
				</MapContainer>
            </div>
		</>
	);
}
