import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official"


export function Grafico({ dadosPesquisa }: any) {
	let maiorTimeline: any;
	let series: any;

	if (dadosPesquisa.length > 1) {
		maiorTimeline = dadosPesquisa.reduce((maior: any, atual: any) => {
			return atual.timeline.length > maior.timeline.length ? atual : maior;
		}).timeline;

		series = dadosPesquisa.map((r: any) => {
			const valoresAlinhados = maiorTimeline.map((data: any) => {
				const index = r.timeline.indexOf(data);
				return index !== -1 ? r.values[index] : null; // Highcharts aceita null para gaps
			});

			return {
				name: r.colecao,
				data: valoresAlinhados,
			};
		});
	} else {
		const unico = Array.isArray(dadosPesquisa) ? dadosPesquisa[0] : dadosPesquisa;

		maiorTimeline = unico.timeline;
		series = [
			{
				name: unico.colecao,
				data: unico.values,
			},
		];
	}

	const options: Highcharts.Options = {
		title: {
			text: "Comparativo de Satélites",
			align: "center",
			style: {
				fontSize: "20px",
				fontWeight: "bold",
				color: "#333",
			},
		},
		xAxis: [
			{
				categories: maiorTimeline,
				title: { text: "Datas" },
			},
		],
		yAxis: [
			{
				title: { text: "NDVI" },
			},
		],
		tooltip: {
			shared: true,
		},
		plotOptions: {
			series: {
				connectNulls: true,
				marker: {
					enabled: true,
					radius: 4,
				},
			},
		},
		exporting: {
			enabled: true
		},
		series: series as Highcharts.SeriesOptionsType[],
	};

	return <HighchartsReact highcharts={Highcharts} options={options} containerProps={{
		style: { 
			height: "100%",
		} 
	}} />;
}
