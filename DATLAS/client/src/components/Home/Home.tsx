import { Header } from "../Header/Header";
import styles from "./Home.module.css"
import gifPlanet from "../../assets/terra.gif"
import iconMap from "../../assets/map-icon.png"
import { useNavigate } from "react-router-dom";

export function Home(){

    const navigate = useNavigate()

    return (
        <>
            <div className={styles.home}>
                <Header />
                <div className={styles.backgroundPlanet}>
                    <button className={styles.goMap} onClick={() => navigate("/mapa")}>
                        <img src={iconMap} alt="" /> 
                        Ir para o Mapa   
                    </button>
                </div>
            </div>
        </>
    )
}