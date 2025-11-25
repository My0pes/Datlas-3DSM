import styles from "./Header.module.css";
import logo from "../../assets/logo-site.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type HeaderProps = {
	visible: boolean
}

export function Header({visible}: HeaderProps) {
	const [headerVisible, setHeaderVisible] = useState<boolean>(true)

	useEffect(() => {
		if (visible){
			setHeaderVisible(true)
		}
	}), [visible]

	

	return (
		<>
			<header className={headerVisible === true ? styles.header : styles.disable}>
				<div className={styles.logo}>
					<img src={logo} alt="" />
				</div>
				<nav className={styles.menu}>
					<Link to="/">Home</Link>
					<Link to="/mapa">Mapa</Link>
					<Link to="/quem-somos">Quem Somos</Link>
				</nav>
			</header>
		</>
	);
}
