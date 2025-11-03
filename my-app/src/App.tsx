// src/App.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Interfaces (mesmas)
interface SatelliteData {
  satellite: string;
  collection_id: string;
  resolution_spatial: string;
  resolution_temporal: string;
  variables: string[];
}

interface TimeSeriesData {
  timeline: string[];
  values: { [key: string]: (number | null)[] };
}

const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

const App: React.FC = () => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [filteredSatellites, setFilteredSatellites] = useState<SatelliteData[]>([]);  // Nova: apenas compatíveis com WTSS
  const [wtssCoverages, setWtssCoverages] = useState<string[]>([]);  // Nova: lista de coverages WTSS
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedComparisons, setSelectedComparisons] = useState<{ coverage: string; band: string }[]>([
    { coverage: '', band: '' },
    { coverage: '', band: '' },
  ]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);

  // Nova: Fetch lista de coverages WTSS no load
  useEffect(() => {
    const fetchWtssCoverages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/wtss/coverages');
        if (!response.ok) throw new Error('Erro ao carregar coverages WTSS');
        const data: string[] = await response.json();
        setWtssCoverages(data);
      } catch (err) {
        console.error('Erro ao fetch WTSS coverages:', err);
      }
    };
    fetchWtssCoverages();
  }, []);

  const handleMapClick = async (lat: number, lng: number) => {
    setLatLng({ lat, lng });
    setLoading(true);
    setError(null);
    setSatellites([]);
    setFilteredSatellites([]);
    setTimeSeries([]);

    try {
      const response = await fetch(`http://localhost:3000/api/stac/collections?lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data: SatelliteData[] = await response.json();
      if (data.length === 0) {
        setError('Nenhum satélite disponível para este ponto.');
      } else {
        setSatellites(data);
        // Filtra apenas compatíveis com WTSS
        const compatible = data.filter(sat => wtssCoverages.includes(sat.collection_id));
        setFilteredSatellites(compatible);
        if (compatible.length === 0) {
          setError('Nenhuma coverage compatível com séries temporais disponível.');
        } else {
          // Defaults
          setSelectedComparisons([
            { coverage: compatible[0]?.collection_id || '', band: compatible[0]?.variables[0] || '' },
            { coverage: compatible[1]?.collection_id || '', band: compatible[1]?.variables[0] || '' },
          ]);
        }
      }
    } catch (err) {
      setError(`Erro ao consultar STAC: ${(err as Error).message}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleComparisonChange = (index: number, field: 'coverage' | 'band', value: string) => {
    const updated = [...selectedComparisons];
    updated[index][field] = value;
    setSelectedComparisons(updated);
  };

  const fetchTimeSeries = async () => {
    if (!latLng) return;
    setLoading(true);
    setError(null);
    setTimeSeries([]);

    try {
      const series: TimeSeriesData[] = [];
      for (const { coverage, band } of selectedComparisons) {
        if (coverage && band) {
          const response = await fetch(
            `http://localhost:3000/api/wtss/timeseries?lat=${latLng.lat}&lng=${latLng.lng}&coverage=${coverage}&bands=${band}&start_date=${startDate}&end_date=${endDate}`
          );
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Erro HTTP: ${response.status}`);
          }
          series.push(await response.json());
        }
      }
      setTimeSeries(series);
    } catch (err) {
      setError(`Erro ao recuperar séries temporais: ${(err as Error).message}.`);
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = () => {
    return timeSeries.map((data, index) => {
      const { coverage, band } = selectedComparisons[index];
      const chartData = {
        labels: data.timeline,
        datasets: [{
          label: `${coverage} - ${band}`,
          data: data.values[band.toUpperCase()] || [], 
          borderColor: index === 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
          backgroundColor: index === 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
          spanGaps: true,
        }],
      };
      const options = {
        responsive: true,
        plugins: {
          title: { display: true, text: `Série Temporal: ${band} (${coverage})` },
        },
        scales: {
          y: { beginAtZero: false },
        },
      };
      return (
        <div key={index} style={{ width: '45%', display: 'inline-block', margin: '10px' }}>
          <Line data={chartData} options={options} />
        </div>
      );
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Datlas - Portal de Dados Geoespaciais</h1>
      <p>Clique no mapa para consultar satélites disponíveis.</p>
      
      <MapContainer center={[-15.7934, -47.8822]} zoom={5} style={{ height: '500px', width: '100%', marginBottom: '20px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onClick={handleMapClick} />
      </MapContainer>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {satellites.length > 0 && (
        <div>
          <h2>Satélites Disponíveis (Todos):</h2>
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

          {filteredSatellites.length > 0 ? (
            <>
              <h2>Comparar Séries Temporais (Apenas Compatíveis com WTSS):</h2>
              {selectedComparisons.map((comp, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <label>Seleção {index + 1}:</label>
                  <select
                    value={comp.coverage}
                    onChange={(e) => handleComparisonChange(index, 'coverage', e.target.value)}
                    style={{ margin: '0 10px' }}
                  >
                    <option value="">Selecione Coverage</option>
                    {filteredSatellites.map((sat) => (
                      <option key={sat.collection_id} value={sat.collection_id}>
                        {sat.satellite} ({sat.collection_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={comp.band}
                    onChange={(e) => handleComparisonChange(index, 'band', e.target.value)}
                  >
                    <option value="">Selecione Variável</option>
                    {filteredSatellites.find((sat) => sat.collection_id === comp.coverage)?.variables.map((varb) => (
                      <option key={varb} value={varb}>
                        {varb}
                      </option>
                    )) || []}
                  </select>
                </div>
              ))}

              <div style={{ marginBottom: '20px' }}>
                <label>Data Início:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ margin: '0 10px' }} />
                <label>Data Fim:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ margin: '0 10px' }} />
                <button onClick={fetchTimeSeries} disabled={loading}>Comparar</button>
              </div>

              {timeSeries.length > 0 && (
                <div>
                  <h2>Gráficos Lado a Lado:</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {renderCharts()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'orange' }}>Nenhuma coverage compatível com séries temporais para este ponto. Tente outro local.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;