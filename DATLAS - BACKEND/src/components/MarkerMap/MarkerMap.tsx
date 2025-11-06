import { useEffect, useRef } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";

type Props = {
	coordenadas: {lat: number, lng: number} | null                 
	onCoordChange?: (coords: {lat: number, lng: number}) => void 
}

export function MarkerMap({coordenadas, onCoordChange}: Props) {
	const popupRef = useRef<any>(null);
	
	useMapEvents({              
		click: (e) => {            
			onCoordChange?.({lat: e.latlng.lat, lng: e.latlng.lng})  
		},
	});

	useEffect(() => {
		
		if (coordenadas) {
			
			setTimeout(() => {
				if (popupRef.current) {
					popupRef.current.openPopup();
				}
			}, 0);
		}
	}, [coordenadas]);

	return coordenadas ? (
		
		<Marker position={coordenadas} ref={popupRef}>
			<Popup>
				Latitude:{coordenadas.lat}, Longitude: {coordenadas.lng}
			</Popup>
		</Marker>
	) : null;
}
