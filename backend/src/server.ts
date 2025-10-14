import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';  // Adicionei para permitir chamadas do front

const app = express();
const PORT = 3000;
const STAC_URL = 'https://data.inpe.br/bdc/stac/v1/';

app.use(cors());  // Permite requests do front (ex.: localhost:5173)
app.use(express.json());  // Para body, se precisar no futuro

// Interface para dados (mesma do front)
interface SatelliteData {
  satellite: string;
  collection_id: string;
  resolution_spatial: string;
  resolution_temporal: string;
  variables: string[];
}

app.get('/api/stac/collections', async (req: Request, res: Response) => {
  console.log('Requisição recebida:', req.query);  // Debug: Veja no console se params chegam

  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng)) {
    console.log('Erro: Params inválidos');  // Debug
    return res.status(400).json({ error: 'Forneça lat e lng válidos.' });
  }

  try {
    console.log('Consultando STAC...');  // Debug
    const collectionsResponse = await axios.get(`${STAC_URL}collections`);
    const collectionIds: string[] = collectionsResponse.data.collections.map((col: any) => col.id);
    console.log(`Encontradas ${collectionIds.length} collections`);  // Debug

    const available: SatelliteData[] = [];
    for (const colId of collectionIds) {
      const colResponse = await axios.get(`${STAC_URL}collections/${colId}`);
      const col = colResponse.data;

      const bbox: number[] = col.extent.spatial.bbox[0];
      if (bbox[0] <= lng && lng <= bbox[2] && bbox[1] <= lat && lat <= bbox[3]) {
        const summaries = col.summaries || {};
        const itemAssets = col.item_assets || {};

        const satellite = col.title?.split('-')[0] || colId.split('-')[0];
        let resSpatial = summaries.gsd?.[0] || 'Não especificado';
        if (typeof resSpatial === 'number') resSpatial = `${resSpatial}m`;

        let resTemporal = 'Não especificado';
        const temporalMatch = colId.match(/(\d+)(D|M)/);
        if (temporalMatch) {
          resTemporal = `${temporalMatch[1]} ${temporalMatch[2] === 'D' ? 'dias' : 'meses'}`;
        }

        const variables: string[] = summaries['eo:bands']?.map((band: any) => band.name) || Object.keys(itemAssets);

        available.push({
          satellite,
          collection_id: colId,
          resolution_spatial: resSpatial as string,
          resolution_temporal: resTemporal,
          variables,
        });
      }
    }

    console.log(`Collections disponíveis: ${available.length}`);  // Debug
    res.json(available);
  } catch (error) {
    console.error('Erro no backend:', error);  // Debug
    res.status(500).json({ error: `Erro ao consultar STAC: ${(error as Error).message}` });
  }
});

// Rota de teste simples na raiz para verificar se o server roda
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend rodando! Use /api/stac/collections?lat=-15.7934&lng=-47.8822 para testar.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});