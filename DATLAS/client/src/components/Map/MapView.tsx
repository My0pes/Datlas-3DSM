import { MapContainer, TileLayer, useMap } from "react-leaflet";
import styles from "./Map.module.css";
import { useState, useEffect } from "react";
import { MarkerMap } from "../MarkerMap/MarkerMap";
import { BuscarEndereco } from "../BuscarEndereco/BuscarEndereco";
import { Dashboard } from "../Dashboard/Dashboard";
import { Header } from "../Header/Header";
import 'leaflet/dist/leaflet.css';

type PropsZoom = {
	zoom: number;
	center: { lat: number; lng: number };
};

function AtualizarZoom({ zoom, center }: PropsZoom) {
	const map = useMap();

	useEffect(() => {
		map.setView(center, zoom);
	}, [center, zoom]);

	return null;
}

export default function MapView() {
	const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: -15.7833, lng: -55.1667 });

	const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);
	const [zoomPosition, setZoomPosition] = useState<number>(5.3);
	const [userInteragiu, setUserInteragiu] = useState(false);
	const [dashboarVisible, setDashboarVisible] = useState(false);
	const [commomAtributes, setCommomAtributes] = useState<[]>([]);
	const [headerVisible, setHeaderVisible] = useState<boolean>(true)

	const recebeCoord = (pos: { lat: number; lng: number }) => {
		setPosition(pos);
		setCoordenadas(pos);
		setUserInteragiu(true);
	};

	useEffect(() => {
		if (userInteragiu) {
			setZoomPosition(8);
			setDashboarVisible(true);
		}
		if (coordenadas) {
			setPosition(coordenadas);
			setDashboarVisible(true);
			setZoomPosition(14);
		}
	}, [position, userInteragiu, coordenadas]);

	useEffect(() => {
		const carregarDados = async () => {
			fetch("http://localhost:3000/wtss/commomAtt")
				.then((res) => res.json())
				.then((commomAtt) => {
					setCommomAtributes(commomAtt);
				});
		};

		carregarDados();
	}, []);

	// Ajustando as coordenadas de zoom para deixar espaço para o dashboard
	const centerSpaceDashboard = {
		lat: position.lat - 0.018,
		lng: position.lng,
	};
	return (
		<>
			{headerVisible && <Header visible={true}/>}
			<div className={styles.map}>
				<MapContainer center={position} zoom={5.3} style={{ height: "100vh", width: "100vw" }}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					<MarkerMap coordenadas={coordenadas} onCoordChange={recebeCoord} />
					<AtualizarZoom zoom={zoomPosition} center={centerSpaceDashboard} />
				</MapContainer>
			</div>
			{dashboarVisible && <Dashboard visible={dashboarVisible} onClose={() => setDashboarVisible(false)} attCommom={commomAtributes} coordenadas={coordenadas}/>}
			<BuscarEndereco onSelecionar={(coords) => setCoordenadas(coords)} />
		</>
	);
}
