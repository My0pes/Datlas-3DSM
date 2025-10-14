const apiKey = import.meta.env.VITE_API_KEY_LOCATIONIQ;   // Api do locationiq

import { useState, useEffect } from "react";
import styles from "./BuscarEndereco.module.css";

type SugestaoEndereco = {
	display_name: string;
	lat: string;
	lon: string;
	address?: {
		city?: string;
		state?: string;
		country?: string;
	};
};

type Props = {
    onSelecionar: (coords: {lat: number, lng: number}) => void
}

export function BuscarEndereco({ onSelecionar }: Props) {
	const [query, setQuery] = useState("");
	const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([]);

	useEffect(() => {
        if(query.length < 3) {
            setSugestoes([])
        }
    
		const buscarugestoes = async () => {
			if (query.length < 3) return;

			const response = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${query}&limit=5&countrycodes=br&normalizecity=1&format=json`);
			const data = await response.json();
			setSugestoes(data);
		};

		const delay = setTimeout(buscarugestoes, 300);

		return () => clearTimeout(delay);
	}, [query]);

	return (
		<>
			<div className={styles.searchMap}>
				<input type="text" placeholder="Digite um endereço" value={query} onChange={(e) => setQuery(e.target.value)} />

				<ul>
					{sugestoes.map((item, index) => (
                        <li key={index} onClick={() => {
                            onSelecionar({lat: parseFloat(item.lat), lng: parseFloat(item.lon)})
                            setQuery("")
                        }}>
                            {item.display_name}
                        </li>
					))}
				</ul>
			</div>
		</>
	);
}