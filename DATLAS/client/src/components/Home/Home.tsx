import { Header } from "../Header/Header";
import styles from "./Home.module.css";
import iconMap from "../../assets/map-icon.png";
import iconContato from "../../assets/contato-icon.png";
import iconQuemSomos from "../../assets/quem-somos-icon.png";
import { useNavigate } from "react-router-dom";

export function Home() {

    const navigate = useNavigate();

    return (
        <>
            <div className={styles.home}>
                <Header visible={true} />

                {/* BACKGROUND + TEXTO + BOTÕES */}
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

                        </div>
                    </div>
                </div>

                {/* BEM VINDO */}
                <div className={styles.welcomeSection}>
                    <h2>Bem vindo!</h2>
                    <div className={styles.underline}></div>
                </div>

                {/* CARDS */}
                <div className={styles.cards}>

                    <div className={styles.card} onClick={() => navigate("/mapa")}>
                        <img src={iconMap} alt=""  />
                        <h3>Explorar</h3>
                    </div>

                    <div className={styles.card} onClick={() => navigate("/quem-somos")}>
                        <img src={iconQuemSomos} alt="" />
                        <h3>Quem Somos</h3>
                    </div>

                    <div className={styles.card} onClick={() => navigate("/quem-somos#footerArea")}>
                        <img src={iconContato} alt="" />
                        <h3>Contato</h3>
                    </div>

                </div>
            </div>
        </>
    );
}
