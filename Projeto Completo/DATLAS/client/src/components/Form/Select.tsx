type props = {
	name: string;
	id: string;
	lista: any;
};

export function Select({ name, id, lista }: props) {

	const listaArray = Array.isArray(lista) ? lista : [];

	const defaultVal = listaArray.length > 0 ? listaArray[0] : name;

	const options = listaArray.includes(defaultVal)
		? listaArray.map((v: any, i: any) => <option value={v} key={i}>{v}</option>)
		: [<option value={defaultVal} key={`first-${defaultVal}`}>{defaultVal}</option>, ...listaArray.map((v: any, i: any) => <option value={v} key={i}>{v}</option>)];

	return (
		<>
			<select name={name} id={id} defaultValue={defaultVal}>
				{options}
			</select>
		</>
	);
}
