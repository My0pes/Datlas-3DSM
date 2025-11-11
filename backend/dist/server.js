"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000;
const STAC_URL = 'https://data.inpe.br/bdc/stac/v1/';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ==========================
// ROTA STAC EXPANDIDA COM FILTROS
// ==========================
app.get('/api/stac/collections', async (req, res) => {
    console.log('Requisição STAC recebida:', req.query);
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const filterSatellite = req.query.satellite?.toLowerCase();
    const filterVariable = req.query.variable?.toLowerCase();
    const filterStart = req.query.start_date;
    const filterEnd = req.query.end_date;
    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Forneça lat e lng válidos.' });
    }
    try {
        const collectionsResponse = await axios_1.default.get(`${STAC_URL}collections`);
        const collectionIds = collectionsResponse.data.collections.map((col) => col.id);
        const available = [];
        for (const colId of collectionIds) {
            const colResponse = await axios_1.default.get(`${STAC_URL}collections/${colId}`);
            const col = colResponse.data;
            const bbox = col.extent.spatial.bbox[0];
            if (!(bbox[0] <= lng && lng <= bbox[2] && bbox[1] <= lat && lat <= bbox[3]))
                continue;
            const satellite = (col.title?.split('-')[0] || colId.split('-')[0]).toLowerCase();
            if (filterSatellite && !satellite.includes(filterSatellite))
                continue;
            const summaries = col.summaries || {};
            const variables = summaries['eo:bands']?.map((band) => band.name.toLowerCase()) ||
                Object.keys(col.item_assets || {}).map(k => k.toLowerCase());
            if (filterVariable && !variables.some(v => v.includes(filterVariable)))
                continue;
            const temporalInterval = col.extent.temporal.interval[0];
            const colStart = temporalInterval[0] ? new Date(temporalInterval[0]) : new Date(0);
            const colEnd = temporalInterval[1] ? new Date(temporalInterval[1]) : new Date();
            if (filterStart && new Date(filterStart) > colEnd)
                continue;
            if (filterEnd && new Date(filterEnd) < colStart)
                continue;
            let resSpatial = summaries.gsd?.[0] || 'Não especificado';
            if (typeof resSpatial === 'number')
                resSpatial = `${resSpatial}m`;
            let resTemporal = 'Não especificado';
            const temporalMatch = colId.match(/(\d+)(D|M)/);
            if (temporalMatch) {
                resTemporal = `${temporalMatch[1]} ${temporalMatch[2] === 'D' ? 'dias' : 'meses'}`;
            }
            const variablesUpper = variables.map(v => v.toUpperCase());
            available.push({
                satellite: col.title?.split('-')[0] || colId.split('-')[0],
                collection_id: colId,
                resolution_spatial: resSpatial,
                resolution_temporal: resTemporal,
                variables: variablesUpper,
            });
        }
        res.json(available);
    }
    catch (error) {
        res.status(500).json({ error: `Erro ao consultar STAC: ${error.message}` });
    }
});
// ==========================
// NOVA ROTA WTSS (listar coverages)
// ==========================
app.get('/api/wtss/coverages', async (req, res) => {
    try {
        const WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/';
        const response = await axios_1.default.get(`${WTSS_URL}list_coverages`);
        res.json(response.data.coverages);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao listar coverages WTSS.' });
    }
});
// ==========================
// ROTA WTSS CORRIGIDA
// ==========================
app.get('/api/wtss/timeseries', async (req, res) => {
    console.log('Requisição WTSS recebida:', req.query);
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const coverage = req.query.coverage;
    const requestedBands = req.query.bands?.split(',') || [];
    const start_date = req.query.start_date || '2020-01-01';
    const end_date = req.query.end_date || new Date().toISOString().split('T')[0];
    if (isNaN(lat) || isNaN(lng) || !coverage || requestedBands.length === 0) {
        return res.status(400).json({ error: 'Forneça lat, lng, coverage e bands válidos.' });
    }
    try {
        const WTSS_URL = 'https://data.inpe.br/bdc/wtss/v4/';
        const coveragesResponse = await axios_1.default.get(`${WTSS_URL}list_coverages`);
        const availableCoverages = coveragesResponse.data.coverages;
        if (!availableCoverages.includes(coverage)) {
            return res.status(400).json({ error: `Coverage '${coverage}' não disponível.` });
        }
        const describeResponse = await axios_1.default.get(`${WTSS_URL}${coverage}`);
        const coverageMeta = describeResponse.data;
        const availableBands = coverageMeta.bands.map((b) => b.name);
        const bandScales = {};
        coverageMeta.bands.forEach((b) => {
            bandScales[b.name] = { scale: b.scale || 1, nodata: b.nodata || 0 };
        });
        const derivativeMap = {
            NDVI: ['B04', 'B08'],
            EVI: ['B04', 'B08', 'B02'],
            NBR: ['B08', 'B12'],
        };
        const attributesToRequest = [];
        const bandsToCompute = [];
        requestedBands.forEach(band => {
            let upper = band.toUpperCase();
            if (availableBands.includes(upper)) {
                attributesToRequest.push(upper);
            }
            else if (derivativeMap[upper]) {
                attributesToRequest.push(...derivativeMap[upper]);
                bandsToCompute.push(upper);
            }
            else {
                return res.status(400).json({ error: `Banda '${upper}' não disponível nem derivável para ${coverage}.` });
            }
        });
        const uniqueAttributes = [...new Set(attributesToRequest)];
        const invalidBands = uniqueAttributes.filter(b => !availableBands.includes(b));
        if (invalidBands.length > 0) {
            return res.status(400).json({
                error: `Bandas inválidas para a coverage ${coverage}: ${invalidBands.join(', ')}`,
                bandas_disponiveis: availableBands,
            });
        }
        const params = {
            coverage,
            attributes: uniqueAttributes.join(','),
            latitude: lat,
            longitude: lng,
            start_date,
            end_date,
        };
        const timeSeriesResponse = await axios_1.default.get(`${WTSS_URL}time_series`, { params });
        const data = timeSeriesResponse.data.result;
        let values = data.attributes.reduce((acc, attr) => {
            const bandName = attr.attribute;
            const scaleInfo = bandScales[bandName];
            if (!scaleInfo) {
                acc[bandName] = attr.values;
                return acc;
            }
            acc[bandName] = attr.values.map((val) => (val === scaleInfo.nodata ? null : val * scaleInfo.scale));
            return acc;
        }, {});
        bandsToCompute.forEach(derivative => {
            switch (derivative) {
                case 'NDVI':
                    if (values['B08'] && values['B04']) {
                        values['NDVI'] = values['B08'].map((nir, i) => {
                            const red = values['B04'][i];
                            if (nir === null || red === null)
                                return null;
                            return (nir - red) / (nir + red + 1e-10);
                        });
                    }
                    break;
                case 'EVI':
                    if (values['B08'] && values['B04'] && values['B02']) {
                        values['EVI'] = values['B08'].map((nir, i) => {
                            const red = values['B04'][i];
                            const blue = values['B02'][i];
                            if (nir === null || red === null || blue === null)
                                return null;
                            return 2.5 * (nir - red) / (nir + 6 * red - 7.5 * blue + 1);
                        });
                    }
                    break;
                case 'NBR':
                    if (values['B08'] && values['B12']) {
                        values['NBR'] = values['B08'].map((nir, i) => {
                            const swir2 = values['B12'][i];
                            if (nir === null || swir2 === null)
                                return null;
                            return (nir - swir2) / (nir + swir2 + 1e-10);
                        });
                    }
                    break;
            }
        });
        const finalValues = {};
        requestedBands.forEach(band => {
            const upper = band.toUpperCase();
            if (values[upper])
                finalValues[upper] = values[upper];
        });
        const formatted = {
            timeline: data.timeline,
            values: finalValues,
        };
        res.json(formatted);
    }
    catch (error) {
        console.error('Erro WTSS:', error.response?.data || error.message);
        res.status(500).json({ error: `Erro ao consultar WTSS: ${error.response?.data?.description || error.response?.data || error.message}` });
    }
});
// ==========================
// ROTA DE TESTE
// ==========================
app.get('/', (req, res) => {
    res.json({
        message: 'Backend rodando! Use /api/stac/collections?lat=-15.7934&lng=-47.8822 ou /api/wtss/timeseries para testar.',
    });
});
// ✅ EXPORTA PARA TESTES
exports.default = app;
// ✅ INICIA O SERVIDOR (somente quando executado diretamente)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}
