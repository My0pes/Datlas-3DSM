import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import { stringify } from 'csv-stringify/sync';  // ✅ Import para CSV

const app = express();
const PORT = 3000;
const STAC_URL = 'https://data.inpe.br/bdc/stac/v1/';
const WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/';

app.use(cors());
app.use(express.json());

interface SatelliteData {
  satellite: string;
  collection_id: string;
  resolution_spatial: string;
  resolution_temporal: string;
  variables: string[];
}

// =======================================================
// 🔹 Função auxiliar reutilizável: buscar coleções STAC
// =======================================================
async function getStacCollections(
  lat: number,
  lng: number,
  filterSatellite?: string,
  filterVariable?: string,
  filterStart?: string,
  filterEnd?: string
): Promise<SatelliteData[]> {
  const collectionsResponse = await axios.get(`${STAC_URL}collections`);
  const collectionIds: string[] = collectionsResponse.data.collections.map((col: any) => col.id);

  const available: SatelliteData[] = [];
  for (const colId of collectionIds) {
    const colResponse = await axios.get(`${STAC_URL}collections/${colId}`);
    const col = colResponse.data;

    const bbox: number[] = col.extent.spatial.bbox[0];
    if (!(bbox[0] <= lng && lng <= bbox[2] && bbox[1] <= lat && lat <= bbox[3])) continue;

    const satellite = (col.title?.split('-')[0] || colId.split('-')[0]).toLowerCase();
    if (filterSatellite && !satellite.includes(filterSatellite.toLowerCase())) continue;

    const summaries = col.summaries || {};
    const variables: string[] =
      summaries['eo:bands']?.map((band: any) => band.name.toLowerCase()) ||
      Object.keys(col.item_assets || {}).map(k => k.toLowerCase());
    if (filterVariable && !variables.some(v => v.includes(filterVariable.toLowerCase()))) continue;

    const temporalInterval = col.extent.temporal.interval[0];
    const colStart = temporalInterval[0] ? new Date(temporalInterval[0]) : new Date(0);
    const colEnd = temporalInterval[1] ? new Date(temporalInterval[1]) : new Date();
    if (filterStart && new Date(filterStart) > colEnd) continue;
    if (filterEnd && new Date(filterEnd) < colStart) continue;

    let resSpatial = summaries.gsd?.[0] || 'Não especificado';
    if (typeof resSpatial === 'number') resSpatial = `${resSpatial}m`;

    let resTemporal = 'Não especificado';
    const temporalMatch = colId.match(/(\d+)(D|M)/);
    if (temporalMatch) {
      resTemporal = `${temporalMatch[1]} ${temporalMatch[2] === 'D' ? 'dias' : 'meses'}`;
    }

    available.push({
      satellite: col.title?.split('-')[0] || colId.split('-')[0],
      collection_id: colId,
      resolution_spatial: resSpatial,
      resolution_temporal: resTemporal,
      variables: variables.map(v => v.toUpperCase()),
    });
  }

  return available;
}

// =======================================================
// 🔹 ROTA STAC EXPANDIDA COM FILTROS
// =======================================================
app.get('/api/stac/collections', async (req: Request, res: Response) => {
  console.log('Requisição STAC recebida:', req.query);

  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const filterSatellite = req.query.satellite as string;
  const filterVariable = req.query.variable as string;
  const filterStart = req.query.start_date as string;
  const filterEnd = req.query.end_date as string;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Forneça lat e lng válidos.' });
  }

  try {
    const available = await getStacCollections(lat, lng, filterSatellite, filterVariable, filterStart, filterEnd);
    res.json(available);
  } catch (error: any) {
    res.status(500).json({ error: `Erro ao consultar STAC: ${error.message}` });
  }
});

// =======================================================
// 🔹 ROTA WTSS (listar coverages)
// =======================================================
app.get('/api/wtss/coverages', async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${WTSS_URL}list_coverages`);
    res.json(response.data.coverages);
  } catch {
    res.status(500).json({ error: 'Erro ao listar coverages WTSS.' });
  }
});

// =======================================================
// 🔹 ROTA WTSS (séries temporais)
// =======================================================
app.get('/api/wtss/timeseries', async (req: Request, res: Response) => {
  console.log('Requisição WTSS recebida:', req.query);

  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const coverage = req.query.coverage as string;
  const requestedBands = (req.query.bands as string)?.split(',') || [];
  const start_date = req.query.start_date as string || '2020-01-01';
  const end_date = req.query.end_date as string || new Date().toISOString().split('T')[0];

  if (isNaN(lat) || isNaN(lng) || !coverage || requestedBands.length === 0) {
    return res.status(400).json({ error: 'Forneça lat, lng, coverage e bands válidos.' });
  }

  try {
    const coveragesResponse = await axios.get(`${WTSS_URL}list_coverages`);
    const availableCoverages: string[] = coveragesResponse.data.coverages;

    if (!availableCoverages.includes(coverage)) {
      return res.status(400).json({ error: `Coverage '${coverage}' não disponível.` });
    }

    const describeResponse = await axios.get(`${WTSS_URL}${coverage}`);
    const coverageMeta = describeResponse.data;
    const availableBands = coverageMeta.bands.map((b: any) => b.name);
    const bandScales: Record<string, { scale: number; nodata: number }> = {};
    coverageMeta.bands.forEach((b: any) => {
      bandScales[b.name] = { scale: b.scale || 1, nodata: b.nodata || 0 };
    });

    const derivativeMap: Record<string, string[]> = {
      NDVI: ['B04', 'B08'],
      EVI: ['B04', 'B08', 'B02'],
      NBR: ['B08', 'B12'],
    };

    const attributesToRequest: string[] = [];
    const bandsToCompute: string[] = [];

    requestedBands.forEach(band => {
      const upper = band.toUpperCase();
      if (availableBands.includes(upper)) {
        attributesToRequest.push(upper);
      } else if (derivativeMap[upper]) {
        attributesToRequest.push(...derivativeMap[upper]);
        bandsToCompute.push(upper);
      }
    });

    const uniqueAttributes = [...new Set(attributesToRequest)];
    const params = {
      coverage,
      attributes: uniqueAttributes.join(','),
      latitude: lat,
      longitude: lng,
      start_date,
      end_date,
    };

    const timeSeriesResponse = await axios.get(`${WTSS_URL}time_series`, { params });
    const data = timeSeriesResponse.data.result;

    let values: Record<string, (number | null)[]> = {};
    data.attributes.forEach((attr: any) => {
      const bandName = attr.attribute;
      const scaleInfo = bandScales[bandName];
      values[bandName] = attr.values.map((val: number) =>
        val === scaleInfo.nodata ? null : val * scaleInfo.scale
      );
    });

    // Derivadas
    bandsToCompute.forEach(derivative => {
      switch (derivative) {
        case 'NDVI':
          values['NDVI'] = values['B08'].map((nir, i) => {
            const red = values['B04'][i];
            return nir && red ? (nir - red) / (nir + red + 1e-10) : null;
          });
          break;
        case 'EVI':
          values['EVI'] = values['B08'].map((nir, i) => {
            const red = values['B04'][i];
            const blue = values['B02'][i];
            return nir && red && blue
              ? 2.5 * (nir - red) / (nir + 6 * red - 7.5 * blue + 1)
              : null;
          });
          break;
        case 'NBR':
          values['NBR'] = values['B08'].map((nir, i) => {
            const swir2 = values['B12'][i];
            return nir && swir2 ? (nir - swir2) / (nir + swir2 + 1e-10) : null;
          });
          break;
      }
    });

    const finalValues: Record<string, (number | null)[]> = {};
    requestedBands.forEach(b => {
      const upper = b.toUpperCase();
      if (values[upper]) finalValues[upper] = values[upper];
    });

    res.json({ timeline: data.timeline, values: finalValues });
  } catch (error: any) {
    console.error('Erro WTSS:', error.message);
    res.status(500).json({ error: `Erro ao consultar WTSS: ${error.message}` });
  }
});

// =======================================================
// 🔹 NOVAS ROTAS DE EXPORTAÇÃO CSV
// =======================================================

// CSV Metadados
app.get('/api/export/csv/metadados', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const filterSatellite = req.query.satellite as string;
  const filterVariable = req.query.variable as string;
  const filterStart = req.query.start_date as string;
  const filterEnd = req.query.end_date as string;

  try {
    const available = await getStacCollections(lat, lng, filterSatellite, filterVariable, filterStart, filterEnd);

    if (available.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado para exportar.' });
    }

    const csvData = [
      ['Satellite', 'Collection ID', 'Resolução Espacial', 'Resolução Temporal', 'Variáveis'],
      ...available.map(sat => [
        sat.satellite,
        sat.collection_id,
        sat.resolution_spatial,
        sat.resolution_temporal,
        sat.variables.join(', '),
      ]),
    ];

    const csvString = stringify(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment('metadados_satélites.csv');
    res.send(csvString);
  } catch {
    res.status(500).json({ error: 'Erro ao gerar CSV de metadados.' });
  }
});

// CSV Séries
app.get('/api/export/csv/series', async (req: Request, res: Response) => {
  const { lat, lng, coverage, bands, start_date, end_date } = req.query;
  const parsedBands = (bands as string)?.split(',') || [];

  if (!lat || !lng || !coverage || parsedBands.length === 0) {
    return res.status(400).json({ error: 'Forneça params válidos.' });
  }

  try {
    const url = `http://localhost:${PORT}/api/wtss/timeseries`;
    const { data } = await axios.get(url, {
      params: {
        lat,
        lng,
        coverage,
        bands: parsedBands.join(','),
        start_date,
        end_date,
      },
    });

    if (data.timeline.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado para exportar.' });
    }

    const headers = ['Timeline', ...parsedBands.map(b => b.toUpperCase())];
    const csvData = [headers];
    data.timeline.forEach((time: string, i: number) => {
      const row = [time];
      parsedBands.forEach(b => row.push(data.values[b.toUpperCase()][i] ?? 'null'));
      csvData.push(row);
    });

    const csvString = stringify(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment('series_temporais.csv');
    res.send(csvString);
  } catch {
    res.status(500).json({ error: 'Erro ao gerar CSV de séries.' });
  }
});

// =======================================================
// 🔹 NOVAS ROTAS DE EXPORTAÇÃO JSON
// =======================================================

// JSON Metadados
app.get('/api/export/json/metadados', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const filterSatellite = req.query.satellite as string;
  const filterVariable = req.query.variable as string;
  const filterStart = req.query.start_date as string;
  const filterEnd = req.query.end_date as string;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Forneça lat e lng válidos.' });
  }

  try {
    const available = await getStacCollections(
      lat,
      lng,
      filterSatellite,
      filterVariable,
      filterStart,
      filterEnd
    );

    if (available.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado para exportar.' });
    }

    res.header('Content-Type', 'application/json');
    res.attachment('metadados_satélites.json');
    res.send(JSON.stringify(available, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: `Erro ao gerar JSON de metadados: ${error.message}` });
  }
});

// JSON Séries
app.get('/api/export/json/series', async (req: Request, res: Response) => {
  const { lat, lng, coverage, bands, start_date, end_date } = req.query;
  const parsedBands = (bands as string)?.split(',') || [];

  if (!lat || !lng || !coverage || parsedBands.length === 0) {
    return res.status(400).json({ error: 'Forneça params válidos.' });
  }

  try {
    const url = `http://localhost:${PORT}/api/wtss/timeseries`;

    const response = await axios.get(url, {
      params: {
        lat,
        lng,
        coverage,
        bands: parsedBands.join(','),
        start_date,
        end_date
      },
    });

    const { timeline, values } = response.data;

    if (!timeline || timeline.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado para exportar.' });
    }

    const formatted = {
      lat,
      lng,
      coverage,
      bands: parsedBands,
      start_date,
      end_date,
      timeline,
      values
    };

    res.header('Content-Type', 'application/json');
    res.attachment('series_temporais.json');
    res.send(JSON.stringify(formatted, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: `Erro ao gerar JSON de séries: ${error.message}` });
  }
});

// =======================================================
// 🔹 ROTA DE TESTE
// =======================================================
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Backend rodando! Use /api/stac/collections?lat=-15.7934&lng=-47.8822 ou /api/wtss/timeseries para testar.',
  });
});

// =======================================================
// 🔹 EXPORTA PARA TESTES E INICIA SERVIDOR
// =======================================================
export default app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
}
