import styles from "./Header.module.css";
import logo from "../../assets/logo-site.png";
import { Link } from "react-router-dom";

export function Header() {
	return (
		<>
			<header className={styles.header}>
				<div className={styles.logo}>
					<img src={logo} alt="" />
				</div>
				<nav className={styles.menu}>
					<Link to="/">Home</Link>
					<Link to="/mapa">Mapa</Link>
					<a href="#">Quem Somos</a>
				</nav>
			</header>
		</>
	);
}
