import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface SatelliteData {
  satellite: string;
  collection_id: string;
  resolution_spatial: string;
  resolution_temporal: string;
  variables: string[];
}

const MapClickHandler: React.FC<{ onClick: (e: L.LeafletMouseEvent) => void }> = ({ onClick }) => {
  useMapEvents({
    click: onClick,
  });
  return null;
};

const MapComponent: React.FC = () => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setError(null);
    setSatellites([]);

    try {
      const response = await fetch(`http://localhost:3000/api/stac/collections?lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const data: SatelliteData[] = await response.json();
      if (data.length === 0) setError('Nenhum satélite disponível para este ponto.');
      else setSatellites(data);
    } catch (err) {
      setError(`Erro ao consultar STAC: ${(err as Error).message}`);
    }
  };

  return (
    <div>
      <MapContainer
        center={[-15.7934, -47.8822]}
        zoom={4}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onClick={handleMapClick} />
      </MapContainer>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {satellites.length > 0 && (
        <ul>
          {satellites.map((sat, index) => (
            <li key={index}>
              {sat.satellite} - Espacial: {sat.resolution_spatial}, Temporal: {sat.resolution_temporal}, Variáveis: {sat.variables.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MapComponent;
