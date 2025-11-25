import { Header } from "../Header/Header";
import styles from "./QuemSomos.module.css";
import shadowImage from "../../assets/thumbnail_logo-equipe.png";
import iconFatec from "../../assets/fatec_jacarei.png";
import iconMyopes from "../../assets/thumbnail_logo-equipe.png";
import iconSite from "../../assets/logo-site.png";
import { useEffect } from "react";

export default function QuemSomos() {

    
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, []);

    return (
        <div>
            <Header visible={true} />

            <section className={styles.hero}>
                <div className={styles.textArea}>
                    <h1>Quem Somos</h1>
                </div>

                <div className={styles.imageArea}>
                    <img 
                        src={shadowImage}
                        alt="Equipe Myopes" 
                    />
                </div>
            </section>

            <section className={styles.content}>
               <p>Somos a equipe Myopes, um grupo de estudantes da Faculdade Fatec Jacareí, dedicados ao desenvolvimento de software multiplataforma. Este projeto integra o semestre acadêmico e representa um passo importante na nossa jornada de formação profissional, reunindo conhecimentos adquiridos ao longo do curso e colocando-os em prática por meio de um desafio real.</p>
                <p>O site Datlas foi idealizado para oferecer uma visualização clara e acessível de informações extraídas de satélites, aplicadas ao estudo de terrenos, formações e padrões geológicos. Para isso, utilizamos um mapa interativo que concentra dados relevantes e possibilita a comparação de indicadores por meio de gráficos sobrepostos. Nosso objetivo é facilitar a interpretação das informações e contribuir para análises mais precisas e fundamentadas, valorizando a confiabilidade dos dados e a clareza na apresentação.</p>
                <p>Este trabalho não teria sido possível sem a orientação e a colaboração de pessoas essenciais. Agradecemos ao cliente, cuja proposta e feedback foram fundamentais para direcionar o desenvolvimento do projeto. Registramos também nosso reconhecimento ao professor mediador Arley, que acompanhou cada etapa com atenção e incentivo. Estendemos nossa gratidão a todos os professores da instituição, cujo ensino constante nos preparou para enfrentar desafios técnicos e conceituais com segurança e responsabilidade.</p>
                <p>A equipe Myopes acredita que este projeto representa o resultado de um semestre de estudos e um reflexo do compromisso coletivo com a aprendizagem, a pesquisa e a qualidade. Esperamos que o Datlas ofereça uma experiência útil, clara e intuitiva para quem busca compreender melhor os fenômenos geológicos por meio de dados espaciais.</p>
            </section>

            <section className={styles.footerBox} id="footerArea">
                <p className={styles.email}>contato@myopes.com</p>

                <div className={styles.iconRow}>
                    <img src={iconMyopes} alt="icone 1" />
                    <img src={iconSite} alt="icone 2" />
                    <img src={iconFatec} alt="icone 3" />
                </div>
            </section>
        </div>
    );
}