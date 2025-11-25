import { Header } from "../Header/Header";
<<<<<<< Updated upstream
import styles from "./Home.module.css";
import iconMap from "../../assets/map-icon.png";
import { useNavigate } from "react-router-dom";

export function Home() {
=======
import styles from "./Home.module.css"
// import gifPlanet from "../../assets/terra.gif" // Mantido como comentário
// import iconMap from "../../assets/map-icon.png" // Mantido como comentário
import { useNavigate } from "react-router-dom";

// NOTA: Você precisará importar os ícones dos cards aqui se forem arquivos locais.
// Exemplo:
// import iconExplore from "../../assets/icon-explore.svg"; 

export function Home(){
>>>>>>> Stashed changes

    const navigate = useNavigate();

    return (
        <>
            <div className={styles.home}>
<<<<<<< Updated upstream
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

=======
                <Header />
                
                {/* Seção do Background e Botões (Parte Superior) */}
                <div className={styles.backgroundPlanet}>
                    {/* Texto "Transformando dados espaciais..." */}
                    <h1 className={styles.heroText}>Transformando dados espaciais em conhecimentos</h1>
                    
                    {/* Contêiner para os botões "Explorar mapas" e "Demonstração" */}
                    <div className={styles.heroButtons}>
                        <button className={styles.exploreButton} onClick={() => navigate("/mapa")}>
                            Explorar Mapas 🗺️
                        </button>
                        <button className={styles.demoButton}>
                            Demonstração
                        </button>
                    </div>
>>>>>>> Stashed changes
                </div>

                {/* --- SEÇÃO DOS CARDS (Parte Branca) --- */}
                <section className={styles.cardsSection}>
                    <h2 className={styles.welcomeTitle}>Bem vindo!</h2> {/* Título "Bem vindo!" */}
                    
                    <div className={styles.cardsContainer}> {/* Contêiner para os cards */}
                        
                        {/* Card 1: Explorar Mapas */}
                        <div className={styles.card}>
                            {/* NOTA: ÍCONE CARD 1 AQUI */}
                            <img src={"/caminho/para/icon-mapa.svg"} alt="Ícone Explorar" className={styles.cardIcon}/>
                            <h3 className={styles.cardTitle}>Explorar</h3>
                            <p className={styles.cardDescription}>Mapas</p> 
                        </div>

                        {/* Card 2: Serviços */}
                        <div className={styles.card}>
                            {/* NOTA: ÍCONE CARD 2 AQUI */}
                            <img src={"/caminho/para/icon-servicos.svg"} alt="Ícone Serviços" className={styles.cardIcon}/>
                            <h3 className={styles.cardTitle}>Serviços</h3>
                            <p className={styles.cardDescription}>Visualize e interaja com diversos mapas temáticos e dados espaciais.</p>
                        </div>

                        {/* Card 3: Contato */}
                        <div className={styles.card}>
                            {/* NOTA: ÍCONE CARD 3 AQUI */}
                            <img src={"/caminho/para/icon-contato.svg"} alt="Ícone Contato" className={styles.cardIcon}/>
                            <h3 className={styles.cardTitle}>Serviços</h3>
                            <p className={styles.cardDescription}>Entre em contato conosco para dúvidas, suporte ou parcerias.</p>
                        </div>
                    </div>
                </section>
                {/* --------------------------------------------- */}

                {/* --- NOVO RODAPÉ --- */}
                <footer className={styles.footer}>
                    {/* Conteúdo do rodapé */}
                </footer>
                {/* ------------------- */}
            </div>
        </>
    );
}
