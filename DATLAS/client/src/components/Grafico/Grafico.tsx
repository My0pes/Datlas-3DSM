import Chart from "react-apexcharts";

export function Grafico({ dadosPesquisa }: any) {
	console.log(dadosPesquisa);
	let maiorTimeline: any;
	let series: any;
	if (dadosPesquisa.length > 1) {
		maiorTimeline = dadosPesquisa.reduce((maior: any, atual: any) => {
			return atual.timeline.length > maior.timeline.length ? atual.timeline : maior.timeline;
		});
		series = dadosPesquisa.map((r: any) => {
			const valoresAlinados = maiorTimeline.map((data: any) => {
				const index = r.timeline.indexOf(data);
				return index !== -1 ? r.values[index] : undefined;
			});

			return {
				name: r.colecao,
				data: valoresAlinados,
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

	return (
		<>
			<Chart
				options={{
					chart: { id: "Comparativo" },
					title: {
						text: "Comparativo de Satélites",
						align: "center", // ou 'left', 'right'
						style: {
							fontSize: "20px",
							fontWeight: "bold",
							color: "#333",
						},
					},
					xaxis: { categories: maiorTimeline },
					stroke: {
						curve: "smooth",
					},
					markers: { size: 4 },
					tooltip: { shared: true, intersect: false },
				}}
				series={series}
				type="line"
				width={"100%"}
				height={"100%"}
			/>
		</>
	);
}
