import { Header } from "../Header/Header";
import styles from "./Home.module.css";
import iconMap from "../../assets/map-icon.png";
import { useNavigate } from "react-router-dom";

export function Home() {

    const navigate = useNavigate();

    return (
        <>
            <div className={styles.home}>
                <Header visible={true} />

                <div className={styles.backgroundPlanet}>

                    <div className={styles.leftInfo}>
                        <h1>
                            Transformando dados espaciais em<br />
                            conhecimentos
                        </h1>

                        <div className={styles.btns}>
                            <button 
                                className={styles.btnPrimary} 
                                onClick={() => navigate("/mapa")}
                            >
                                Explorar mapas
                            </button>

                            <button className={styles.btnOutline}>
                                Demonstração
                            </button>
                        </div>
                    </div>
                </div>

                {/* bem vindo gu */}
                <div className={styles.welcomeSection}>
                    <h2>Bem vindo!</h2>
                    <div className={styles.underline}></div>
                </div>

                {/*parte dos cards gu */}
                <div className={styles.cards}>

                    <div className={styles.card}>
                        <img src={iconMap} alt="" />
                        <h3>Explorar</h3>
                        <p>Mapas</p>
                    </div>

                    <div className={styles.card}>
                        <img src={iconMap} alt="" />
                        <h3>Serviços</h3>
                    </div>

                    <div className={styles.card}>
                        <img src={iconMap} alt="" />
                        <h3>Contato</h3>
                    </div>

                </div>
            </div>
        </>
    );
}
