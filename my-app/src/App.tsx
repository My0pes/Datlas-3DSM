import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Interface para dados de satélite
interface SatelliteData {
  satellite: string;
  collection_id: string;
  resolution_spatial: string;
  resolution_temporal: string;
  variables: string[];
}

const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const App: React.FC = () => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMapClick = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    setSatellites([]);

    try {
      const response = await fetch(`http://localhost:3000/api/stac/collections?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data: SatelliteData[] = await response.json();
      if (data.length === 0) {
        setError('Nenhum satélite disponível para este ponto. Tente clicar em uma área com cobertura (ex.: Brasil).');
      } else {
        setSatellites(data);
      }
    } catch (err) {
      setError(`Erro ao consultar: ${(err as Error).message}. Verifique se o backend está rodando em localhost:3000.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Datlas - Portal de Dados Geoespaciais</h1>
      <p>Clique no mapa para consultar satélites disponíveis.</p>
      
      <MapContainer
        center={[-15.7934, -47.8822]} // Brasília
        zoom={5}
        style={{ height: '500px', width: '100%', marginBottom: '20px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onClick={handleMapClick} />
      </MapContainer>

      {loading && <p>Carregando...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {satellites.length > 0 && (
        <div>
          <h2>Satélites Disponíveis:</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {satellites.map((sat, index) => (
              <li key={index} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
                <strong>{sat.satellite}</strong> (ID: {sat.collection_id})<br />
                Resolução Espacial: {sat.resolution_spatial}<br />
                Resolução Temporal: {sat.resolution_temporal}<br />
                Variáveis: {sat.variables.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;