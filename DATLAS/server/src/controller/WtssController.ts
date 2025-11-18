import { Request, Response } from "express";
import { IWtssListCoverages, IWtssResultQuery } from "../models/WtssModels";
import dotenv from "dotenv";

dotenv.config();

const api_wtss = process.env.API_ENV_WTSS;

type commomAtt = {
	name: string,
	colecoes: any[]
}

class WtssController {
	public async searchCoverages(req: Request, res: Response) {
		try {
			const listaCoverages = await fetch(`${api_wtss}/list_coverages`);
			const response: IWtssListCoverages = await listaCoverages.json();
			return res.json(response);
		} catch (e: any) {
			return res.json({ message: e.message });
		}
	}

	// Pega todos coverages e separa as coleções que tem atributos iguais
	public async attributesCommomCoverages(req: Request, res: Response, retry = false): Promise<Response> {
		try {
			const listCoverages = await fetch(`${api_wtss}/list_coverages`);
			let listCoveragesResponse: any = await listCoverages.json();
			listCoveragesResponse = listCoveragesResponse.coverages;
			let listCommomAtributes: commomAtt[] = [];
			let allAtributeslist: object[] = [];
			let searcAtributes: any
			let searcAtributesJson: any
			let nameSat: string
			let searcAtributesBands: any
			let allAtributesUnique:any = []
			// Pega todos os atributos, mesmo que repetidos
			for( const col of listCoveragesResponse) {
				searcAtributes = await fetch(`${api_wtss}/${col}`);
				searcAtributesJson = await searcAtributes.json();
				nameSat = col
				searcAtributesBands = searcAtributesJson.bands;
				
				// 
				while(typeof searcAtributesBands === "undefined"){
					searcAtributes = await fetch(`${api_wtss}/${col}`);
					searcAtributesJson = await searcAtributes.json();
					nameSat = col
					searcAtributesBands = searcAtributesJson.bands;
				}
				searcAtributesBands.forEach((bandName: any) => {
					allAtributeslist.push(bandName.name)
				})
				
				allAtributesUnique = [... new Set(allAtributeslist)]
				allAtributesUnique.forEach((att: string) => {
					const temNaLista = listCommomAtributes.some((item) => item.name == att)
					const satTemAtt = searcAtributesBands.some((item:any) => item.name == att)

					if(temNaLista){
						const index = listCommomAtributes.findIndex((item) => item.name == att)
						if(index !== -1){
							listCommomAtributes[index]?.colecoes.push(nameSat)
						}
					}else{
						listCommomAtributes.push({
							name: att,
							colecoes: [col]
						})
					}
				})
			};
			// console.log(listCommomAtributes)
			return res.json(listCommomAtributes)
		} catch (error: any) {
			console.log("Erro ao buscar atributos", error.message)

			if(!retry){
				console.log("Tentando novamente")
				return this.attributesCommomCoverages(req, res, true)
			}else{
				return res.status(500).json({ message: "Erro ao buscar atributos"})
			}
		}
	
	}

	public async query(req: Request, res: Response){
		const { colecao, filtro, latitude, longitude, data_start, data_end} = req.body
		// console.log("cheguei no backend")
		const responseSearch = await fetch(`https://data.inpe.br/bdc/wtss/v4/time_series?coverage=${colecao}&attributes=${filtro}&start_date=${data_start}&end_date=${data_end}&latitude=${latitude}&longitude=${longitude}`)
		// console.log("minha requisição:", responseSearch)
		const resonseJson = await responseSearch.json()
		// console.log("meu json:", resonseJson)
		const formatResponse = {
			colecao: resonseJson.query.coverage,
			filtro: resonseJson.result.attributes[0].attribute,
			values: resonseJson.result.attributes[0].values,
			timeline: resonseJson.result.timeline

		}
		// console.log("meu json formatado:", formatResponse)
		return res.json(formatResponse)
	}
}

export default new WtssController();
