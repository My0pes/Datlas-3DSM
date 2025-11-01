import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3000;
const STAC_URL = 'https://data.inpe.br/bdc/stac/v1/';

app.use(cors());
app.use(express.json());

interface SatelliteData {
  satellite: string;
  collection_id: string;
  resolution_spatial: string;
  resolution_temporal: string;
  variables: string[];
}

// ROTA STAC EXPANDIDA COM FILTROS
app.get('/api/stac/collections', async (req: Request, res: Response) => {
  console.log('Requisição STAC recebida:', req.query);

  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const filterSatellite = (req.query.satellite as string)?.toLowerCase();  // Ex.: 'sentinel'
  const filterVariable = (req.query.variable as string)?.toLowerCase();  // Ex.: 'ndvi'
  const filterStart = req.query.start_date as string;  // Ex.: '2020-01-01'
  const filterEnd = req.query.end_date as string;  // Ex.: '2023-12-31'

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Forneça lat e lng válidos.' });
  }

  try {
    const collectionsResponse = await axios.get(`${STAC_URL}collections`);
    const collectionIds: string[] = collectionsResponse.data.collections.map((col: any) => col.id);

    const available: SatelliteData[] = [];
    for (const colId of collectionIds) {
      const colResponse = await axios.get(`${STAC_URL}collections/${colId}`);
      const col = colResponse.data;

      const bbox: number[] = col.extent.spatial.bbox[0];
      if (!(bbox[0] <= lng && lng <= bbox[2] && bbox[1] <= lat && lat <= bbox[3])) continue;

      // Filtros
      const satellite = (col.title?.split('-')[0] || colId.split('-')[0]).toLowerCase();
      if (filterSatellite && !satellite.includes(filterSatellite)) continue;

      const summaries = col.summaries || {};
      const variables: string[] = summaries['eo:bands']?.map((band: any) => band.name.toLowerCase()) || Object.keys(col.item_assets || {}).map(k => k.toLowerCase());
      if (filterVariable && !variables.some(v => v.includes(filterVariable))) continue;

      // Filtro temporal (intervalo sobreposto)
      const temporalInterval = col.extent.temporal.interval[0];
      const colStart = temporalInterval[0] ? new Date(temporalInterval[0]) : new Date(0);
      const colEnd = temporalInterval[1] ? new Date(temporalInterval[1]) : new Date();
      if (filterStart && new Date(filterStart) > colEnd) continue;
      if (filterEnd && new Date(filterEnd) < colStart) continue;

      // Parsing de detalhes (igual ao anterior)
      let resSpatial = summaries.gsd?.[0] || 'Não especificado';
      if (typeof resSpatial === 'number') resSpatial = `${resSpatial}m`;

      let resTemporal = 'Não especificado';
      const temporalMatch = colId.match(/(\d+)(D|M)/);
      if (temporalMatch) {
        resTemporal = `${temporalMatch[1]} ${temporalMatch[2] === 'D' ? 'dias' : 'meses'}`;
      }

      const variablesUpper: string[] = variables.map(v => v.toUpperCase());  // Para front

      available.push({
        satellite: col.title?.split('-')[0] || colId.split('-')[0],
        collection_id: colId,
        resolution_spatial: resSpatial as string,
        resolution_temporal: resTemporal,
        variables: variablesUpper,
      });
    }

    res.json(available);
  } catch (error) {
    res.status(500).json({ error: `Erro ao consultar STAC: ${(error as Error).message}` });
  }
});

// ==========================
// NOVA ROTA WTSS (listar coverages)(para filtragem no front)
// ==========================

app.get('/api/wtss/coverages', async (req: Request, res: Response) => {
  try {
    const WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/';
    const response = await axios.get(`${WTSS_URL}list_coverages`);
    res.json(response.data.coverages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar coverages WTSS.' });
  }
});

// ROTA WTSS CORRIGIDA (GET /time_series com parsing fixo para v4)
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
    const WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/';

    // 1️⃣ Lista de coverages disponíveis
    const coveragesResponse = await axios.get(`${WTSS_URL}list_coverages`);
    const availableCoverages: string[] = coveragesResponse.data.coverages;

    if (!availableCoverages.includes(coverage)) {
      return res.status(400).json({ error: `Coverage '${coverage}' não disponível.` });
    }

    // 2️⃣ Metadados (describe_coverage)
    const describeResponse = await axios.get(`${WTSS_URL}${coverage}`);
    const coverageMeta = describeResponse.data;
    const availableBands = coverageMeta.bands.map((b: any) => b.name);
    const bandScales: Record<string, { scale: number; nodata: number }> = {};
    coverageMeta.bands.forEach((b: any) => {
      bandScales[b.name] = { scale: b.scale || 1, nodata: b.nodata || 0 };
    });

    // 3️⃣ Mapeamento de derivadas
    const derivativeMap: Record<string, string[]> = {
      NDVI: ['B04', 'B08'],
      EVI: ['B04', 'B08', 'B02'],
      NBR: ['B08', 'B12'],
    };

    // 4️⃣ Separa attributes, priorizando pré-computadas
    const attributesToRequest: string[] = [];
    const bandsToCompute: string[] = [];

    requestedBands.forEach(band => {
      let upper = band.toUpperCase();
      if (availableBands.includes(upper)) {
        attributesToRequest.push(upper);
      } else if (derivativeMap[upper]) {
        attributesToRequest.push(...derivativeMap[upper]);
        bandsToCompute.push(upper);
      } else {
        return res.status(400).json({ error: `Banda '${upper}' não disponível nem derivável para ${coverage}.` });
      }
    });

    const uniqueAttributes = [...new Set(attributesToRequest)];

    // 5️⃣ Verifica inválidas
    const invalidBands = uniqueAttributes.filter(b => !availableBands.includes(b));
    if (invalidBands.length > 0) {
      return res.status(400).json({
        error: `Bandas inválidas para a coverage ${coverage}: ${invalidBands.join(', ')}`,
        bandas_disponiveis: availableBands,
      });
    }

    // 6️⃣ Requisição GET para /time_series com query params (v4)
    const params = {
      coverage,
      attributes: uniqueAttributes.join(','),
      latitude: lat,
      longitude: lng,
      start_date,
      end_date,
    };

    const timeSeriesResponse = await axios.get(`${WTSS_URL}time_series`, { params });
    const data = timeSeriesResponse.data.result;  // v4 retorna diretamente em result

    // 7️⃣ Formata e aplica escalas/nodata (CORRIGIDO: use 'attribute' não 'band')
    let values: Record<string, (number | null)[]> = data.attributes.reduce((acc: any, attr: any) => {
      const bandName = attr.attribute;  // FIX: 'attribute' na resposta v4
      const scaleInfo = bandScales[bandName];
      if (!scaleInfo) {
        console.warn(`Escala não encontrada para banda: ${bandName}`);  // Debug se faltar
        acc[bandName] = attr.values.map((val: number) => val);  // Fallback sem escala
        return acc;
      }
      acc[bandName] = attr.values.map((val: number) => {
        if (val === scaleInfo.nodata) return null;
        return val * scaleInfo.scale;
      });
      return acc;
    }, {});

    // 8️⃣ Calcula derivadas (se necessário)
    bandsToCompute.forEach(derivative => {
      switch (derivative) {
        case 'NDVI':
          if (values['B08'] && values['B04']) {
            values['NDVI'] = values['B08'].map((nir: number | null, i: number) => {
              const red = values['B04'][i];
              if (nir === null || red === null) return null;
              return (nir - red) / (nir + red + 1e-10);
            });
          }
          break;
        case 'EVI':
          if (values['B08'] && values['B04'] && values['B02']) {
            values['EVI'] = values['B08'].map((nir: number | null, i: number) => {
              const red = values['B04'][i];
              const blue = values['B02'][i];
              if (nir === null || red === null || blue === null) return null;
              return 2.5 * (nir - red) / (nir + 6 * red - 7.5 * blue + 1);
            });
          }
          break;
        case 'NBR':
          if (values['B08'] && values['B12']) {
            values['NBR'] = values['B08'].map((nir: number | null, i: number) => {
              const swir2 = values['B12'][i];
              if (nir === null || swir2 === null) return null;
              return (nir - swir2) / (nir + swir2 + 1e-10);
            });
          }
          break;
      }
    });

    // Filtra para requested
    const finalValues: Record<string, (number | null)[]> = {};
    requestedBands.forEach(band => {
      const upper = band.toUpperCase();
      if (values[upper]) finalValues[upper] = values[upper];
    });

    const formatted = {
      timeline: data.timeline,
      values: finalValues,
    };

    res.json(formatted);
  } catch (error: any) {
    console.error('Erro WTSS:', error.response?.data || error.message);
    res.status(500).json({ error: `Erro ao consultar WTSS: ${error.response?.data?.description || error.response?.data || error.message}` });
  }
});

// ==========================
// ROTA DE TESTE
// ==========================
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Backend rodando! Use /api/stac/collections?lat=-15.7934&lng=-47.8822 ou /api/wtss/timeseries para testar.',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
