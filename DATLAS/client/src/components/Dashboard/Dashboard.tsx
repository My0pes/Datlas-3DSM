import { useEffect, useRef, useState, type JSX } from "react";
import { Select } from "../Form/Select";
import styles from "./Dashboard.module.css";
import { Grafico } from "../Grafico/Grafico";

type DashboardProps = {
	visible: boolean;
	onClose: () => void;
	attCommom: any;
	coordenadas: any;
};

export function Dashboard({ visible, onClose, attCommom, coordenadas }: DashboardProps) {
	const [selecionados, setSelecionados] = useState<[] | undefined>(undefined);
	const [selectNumbers, setSelectNumbers] = useState<JSX.Element[]>([]);
	const [limiteAtingido, setLimiteAtingido] = useState(false);
	const [messageSelect, setMessageSelect] = useState("");
	const [dateStart, setDateStart] = useState<any>();
	const [dateEnd, setDateEnd] = useState<any>();
	const [visibleDashboard, setVisibleDashboard] = useState<boolean>();
	const [todasPesquisas, setTodasPesquisas] = useState<[] | null>(null);
	const formRef = useRef<HTMLFormElement>(null);


	const API_URL = "http://localhost:3000";

	const handleChange = (sat: []) => {
		setSelecionados(sat);
	};

	const handleAddCol = (selecionados: any) => {
		const numberSelecionados = Number(selectNumbers.length);

		if (numberSelecionados < 4 && selecionados.length > 1) {
			const newSelectName = "satelite0" + (numberSelecionados + 1);
			const newSelect = <Select name={newSelectName} id={newSelectName} lista={selecionados} />;
			setSelectNumbers((prev) => [...prev, newSelect]);
			setLimiteAtingido(false);
		} else if (selecionados.length == 1) {
			setMessageSelect("Para esse filtro só existe uma coleção");
			setLimiteAtingido(true);
		} else {
			setMessageSelect("Limite de 4 coleção atingido para comparação");
			setLimiteAtingido(true);
		}
	};

	let filtros = [];

	for (const fil of attCommom) {
		filtros.push(
			<label key={fil.name}>
				<input type="radio" name="filtro" value={fil.name} onChange={() => handleChange(fil.colecoes)} />
				{fil.name}
			</label>
		);
	}
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const dados = {
			satelite01: formData.get("satelite01"),
			satelite02: formData.get("satelite02"),
			satelite03: formData.get("satelite03"),
			satelite04: formData.get("satelite04"),
			longitude: formData.get("longitude"),
			latitude: formData.get("latitude"),
			dataStart: formData.get("dateStart"),
			dataEnd: formData.get("dateEnd"),
			filtro: formData.get("filtro"),
		};

		const colecoes = [dados?.satelite01, dados?.satelite02, dados?.satelite03, dados?.satelite04];
		let resultPesquisa: any = [];
		for (const col of colecoes) {
			if (col) {
				const pesquisa = {
					colecao: col,
					filtro: dados?.filtro,
					latitude: dados?.latitude,
					longitude: dados?.longitude,
					data_start: dados?.dataStart,
					data_end: dados?.dataEnd,
				};
				try {
					const response = await fetch(`${API_URL}/wtss/search`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(pesquisa),
					});
					const data = await response.json();
					resultPesquisa.push(data);
				} catch (error) {
					console.log(error);
				}
			}
		}
		setTodasPesquisas(resultPesquisa);
	};

	useEffect(() => {
		if (selecionados && selecionados?.length > 2) {
			const sat01 = <Select name="satelite01" id="satelite01" lista={selecionados} />;
			const sat02 = <Select name="satelite02" id="satelite02" lista={selecionados} />;
			setSelectNumbers((prev) => [sat01, sat02]);
			setMessageSelect("");
		} else if (selecionados && selecionados?.length < 2) {
			const sat01 = <Select name="satelite01" id="satelite01" lista={selecionados} />;
			setSelectNumbers((prev) => [sat01]);
			setMessageSelect("");
		}

		setDateStart(new Date().toISOString());
		const dataHoje = new Date();
		dataHoje.setFullYear(dataHoje.getFullYear() - 1);
		setDateEnd(dataHoje.toISOString());

		if (visible) {
			setVisibleDashboard(true);
		}
	}, [selecionados, visible, visibleDashboard]);

	useEffect(() => {
		// Sempre que coordenadas mudar, resetamos o estado do Dashboard
		setSelecionados(undefined);
		setSelectNumbers([]);
		setLimiteAtingido(false);
		setMessageSelect("");
		setDateStart(undefined);
		setDateEnd(undefined);
		setTodasPesquisas(null);
		formRef.current?.reset()
	}, [coordenadas]);

	return (
		<>
			<div className={visibleDashboard == true ? styles.dashboard : styles.disable} >
				<form onSubmit={handleSubmit} ref={formRef}>
					<div className={styles.filtros}>
						<p>Filtros</p>
						<div className={styles.filtrosCheck}>{filtros}</div>
					</div>
					<div className={styles.satelites}>
						<input type="text" value={coordenadas.lat} hidden name="latitude" />
						<input type="text" value={coordenadas.lng} hidden name="longitude" />
						{selectNumbers.map((select, index) => (
							<div key={index}>{select}</div>
						))}
						{limiteAtingido && (
							<>
								<p>{messageSelect}</p>
							</>
						)}
						{selecionados && (
							<>
								<label htmlFor="dateStart">Data Inicio</label>
								<input type="date" id="dateStart" name="dateStart" defaultValue={dateEnd.split("T")[0]} />
								<label htmlFor="dateEnd">Data Fim</label>
								<input type="date" id="dateEnd" name="dateEnd" defaultValue={dateStart.split("T")[0]} />
								<button
									onClick={(e) => {
										e.preventDefault();
										handleAddCol(selecionados);
									}}
								>
									+ Adicionar Coleção
								</button>
								<button>Pesquisar</button>
							</>
						)}
					</div>
				</form>
				<div className={styles.chartDashboard}>{todasPesquisas != null && <Grafico dadosPesquisa={todasPesquisas} />}</div>
				<button id={styles.closeDashboard} onClick={onClose}>
					X
				</button>
			</div>
		</>
	);
}
