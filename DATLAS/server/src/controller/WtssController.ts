import { Request, Response } from "express";
import { IWtssListCoverages, IWtssResultQuery } from "../models/WtssModels";
import dotenv from "dotenv";

dotenv.config();

const api_wtss = process.env.API_ENV_WTSS;

type commomAtt = {
    name: string,
    colecoes: any[]
}

// cache em memória simples
let attributesCache: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

class WtssController {
    // helper: fetch json with timeout
    private async fetchWithTimeout(url: string, timeoutMs = 5000) {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const response = await fetch(url, { signal: ctrl.signal });
            clearTimeout(timeout);
            return response;
        } catch (err) {
            clearTimeout(timeout);
            throw err;
        }
    }

    public async searchCoverages(req: Request, res: Response) {
        try {
            console.log(`[searchCoverages] Chamando ${api_wtss}/list_coverages`);
            const listaCoverages = await this.fetchWithTimeout(`${api_wtss}/list_coverages`);
            const response: IWtssListCoverages = await listaCoverages.json();
            return res.json(response);
        } catch (e: any) {
            console.error(`[searchCoverages] Erro:`, e.message);
            return res.json({ message: e.message });
        }
    }

    // Pega todos coverages e separa as coleções que tem atributos iguais
    public async attributesCommomCoverages(req: Request, res: Response, retry = false): Promise<Response> {
        try {
            // retorna cache se ainda válido
            if (attributesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
                console.log("Retornando cache de atributos");
                return res.json(attributesCache);
            }

            console.log(`[attributesCommomCoverages] Chamando ${api_wtss}/list_coverages`);
            const listCoverages = await this.fetchWithTimeout(`${api_wtss}/list_coverages`);
            let listCoveragesResponse: any = await listCoverages.json();
            listCoveragesResponse = listCoveragesResponse.coverages;
            let listCommomAtributes: commomAtt[] = [];
            let allAtributeslist: string[] = [];
            let allAtributesUnique: any = []

            // helper: fetch json with simple retry and content-type check
            const fetchJsonWithRetries = async (url: string, tries = 3, delayMs = 500) => {
                 let lastErr: any;
                 for (let i = 0; i < tries; i++) {
                     try {
                         const r = await this.fetchWithTimeout(url, 5000);
                         if (!r.ok) {
                             const txt = await r.text().catch(() => "");
                             throw new Error(`HTTP ${r.status} ${r.statusText} - ${txt.substring(0,200)}`);
                         }
                         const ct = r.headers.get("content-type") || "";
                         if (!ct.includes("application/json")) {
                             const txt = await r.text().catch(() => "");
                             throw new Error(`Non-JSON response (content-type=${ct}): ${txt.substring(0,200)}`);
                         }
                         return await r.json();
                     } catch (e: any) {
                         lastErr = e;
                         console.warn(`[fetchJsonWithRetries] Tentativa ${i + 1}/${tries} falhou para ${url}: ${e.message}`);
                         if (i < tries - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1))); // backoff
                     }
                 }
                 throw lastErr;
             };

             // Pega todos os atributos
             for (const col of listCoveragesResponse) {
                try {
                    console.log(`[attributesCommomCoverages] Buscando atributos de ${col}`);
                    const searcAtributesJson = await fetchJsonWithRetries(`${api_wtss}/${col}`, 3, 300);
                    const searcAtributesBands = searcAtributesJson.bands || [];
                    searcAtributesBands.forEach((bandName: any) => {
                        allAtributeslist.push(bandName.name)
                    });
                } catch (err: any) {
                    console.warn(`[attributesCommomCoverages] Falha ao buscar atributos da cobertura ${col}:`, err.message || err);
                    // pular esta cobertura e continuar com as demais
                    continue;
                }
            }

            // Separa os atributos, tirando os repetidos
            allAtributesUnique = [... new Set(allAtributeslist)];

            // Separando as coleções por atributos
            for (const col of listCoveragesResponse) {
                try {
                    const searcAtributesJson = await fetchJsonWithRetries(`${api_wtss}/${col}`, 3, 300);
                    const searcAtributesBands = searcAtributesJson.bands || [];
                    const nameSat = col;

                    allAtributesUnique.forEach((att: string) => {
                        const temNaLista = listCommomAtributes.some((item) => item.name == att)
                        const satTemAtt = searcAtributesBands.some((item:any) => item.name == att)

                        if(!temNaLista){
                            listCommomAtributes.push({
                                name: att,
                                colecoes: []
                            })
                        }

                        if(satTemAtt){
                            const index = listCommomAtributes.findIndex((item) => item.name == att)
                            if(index !== -1){
                                listCommomAtributes[index]?.colecoes.push(nameSat)
                            }
                        }
                    });
                } catch (err: any) {
                    console.warn(`Falha ao processar cobertura ${col}:`, err.message || err);
                    continue;
                }
            }

            // armazena no cache
            attributesCache = listCommomAtributes;
            cacheTimestamp = Date.now();

            return res.json(listCommomAtributes)
        } catch (error: any) {
            console.error("[attributesCommomCoverages] Erro:", error.message);
            console.error("[attributesCommomCoverages] Stack:", error.stack);
            console.error("[attributesCommomCoverages] API_ENV_WTSS =", api_wtss);

            // se tiver cache, retorna mesmo que expirado
            if (attributesCache) {
                console.log("Servidor fora, retornando cache expirado");
                return res.json(attributesCache);
            }

            if(!retry){
                console.log("Tentando novamente")
                return this.attributesCommomCoverages(req, res, true)
            }else{
                return res.status(502).json({ 
                    message: "Serviço WTSS indisponível. Tente novamente em alguns minutos.",
                    error: error.message,
                    api_url: api_wtss
                })
            }
        }
    }

    public async query(req: Request, res: Response){
        const { colecao, filtro, latitude, longitude, data_start, data_end} = req.body
        
        try {
            const responseSearch = await fetch(`https://data.inpe.br/bdc/wtss/v4/time_series?coverage=${colecao}&attributes=${filtro}&start_date=${data_start}&end_date=${data_end}&latitude=${latitude}&longitude=${longitude}`);
            
            if (!responseSearch.ok) {
                return res.status(responseSearch.status).json({ message: "Serviço WTSS retornou erro", status: responseSearch.status });
            }

            const resonseJson = await responseSearch.json()
            const formatResponse = {
                colecao: resonseJson.query.coverage,
                filtro: resonseJson.result.attributes[0].attribute,
                values: resonseJson.result.attributes[0].values,
                timeline: resonseJson.result.timeline
            }
            console.log("meu json formatado:", formatResponse)
            return res.json(formatResponse)
        } catch (err: any) {
            console.error("Erro na query WTSS:", err.message);
            return res.status(503).json({ message: "Erro ao processar consulta WTSS", error: err.message });
        }
    }
}

export default new WtssController();
