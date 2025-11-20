type props = {
	name: string;
	id: string;
	lista: any;
};

export function Select({ name, id, lista }: props) {
	let listOption: any = [
        <option defaultValue={name} key={name} hidden>{name}</option>
    ];
	
	lista.forEach((value: any, key: any) => {
		listOption.push(<option value={value} key={key}>{value}</option>);
	});
	
	return (
		<>
			<select name={name} id={id}>
				{listOption}
			</select>
		</>
	);
}
