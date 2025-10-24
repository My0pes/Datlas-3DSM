# Myopes
<div align="center">
</div>
<img src='Repositorio/Imagens repositorio/thumbnail_logo-equipe.png width' ='500'/>
<div>

-----------------------------------------------------------------------------------
 

# 🗂️Data
|Sprint| Data de Início | Data de Entrega | Status | Histórico |
|------|---------------------|--------------------|---------------------|--------------------|  
| 1 | :calendar:  ➡ (22/09) | 📆 ➡ (07/10) | Concluída | [Relatório]()
| 2 | :calendar:  ➡ (13/10) | 📆 ➡ (/) | Não iniciada | [Relatório]()
| 3 | :calendar:  ➡ (06/11) | 📆 ➡ (/) | Não iniciada | [Relatório]()

|       RESTRIÇÕES DE PROJETO E TECNOLOGIA      |  
|-----------------------------------------------|  
| 1. Utilização exclusiva de dados de satélite disponíveis gratuitamente limita as fontes de informação a missões como Landsat, Sentinel, MODIS, entre outras. 
| 2. O tempo disponível para desenvolvimento pelos alunos também será um fator restritivo, exigindo uma delimitação clara do escopo para garantir a conclusão de um produto mínimo viável.
| 3. A disponibilidade de recursos computacionais e de armazenamento para o servidor, caso seja necessária uma infraestrutura própria para o processamento ou cache de dados, pode ser uma restrição.
------------------------------------------------------------------------------------

# 📑PRODUCT BACKLOG
|  Requisitos Funcionais       |                              |                              
|------------------------------|------------------------------|
RF01: Permitir que os usuários selecionem um ponto de interesse em um mapa interativo, preferencialmente utilizando coordenadas geográficas ou um clique direto.
RF02: O sistema deve retornar dinamicamente uma lista de satélites que possuem dados gratuitos
disponíveis para a área, detalhando suas resoluções espacial e temporal (por exemplo, 10m, diário, semanal) e as variáveis geoespaciais oferecidas (como NDVI, EVI, temperatura da superfície, umidade do solo etc.).
RF03: Um requisito central é a capacidade de comparação de dados, onde o usuário poderá selecionar duas ou mais séries temporais de variáveis similares (por exemplo, NDVI de Sentinel-2 e Landsat-8) para a mesma área, visualizando-as lado a lado em gráficos ou pequenas representações visuais.
RF04: A plataforma deve oferecer opções de filtragem por satélite, variável ou período de tempo, facilitando a navegação pelos dados e possibilitando a exportação dos metadados e dos dados brutos ou processados (se aplicável e permitido) para análise posterior.

|   Requisitos Não Funcionais  |                                                                                                                 
|------------------------------|   
RNF01: A usabilidade será um requisito não funcional crítico, exigindo uma interface intuitiva, clara e de fácil navegação, mesmo para usuários sem experiência prévia em geoprocessamento.
RNF02: A performance da aplicação deve ser otimizada para garantir o carregamento rápido do mapa e dos dados, bem como a fluidez na interação, mesmo com grandes volumes de informações geoespaciais.
RNF03: A escalabilidade é outro ponto importante, de forma que a aplicação possa lidar com um número crescente de usuários e fontes de dados de satélite no futuro.
RNF04: A confiabilidade é essencial, garantindo que os dados exibidos sejam precisos, atualizados e corretamente atribuídos às suas fontes originais. 
-----------------------------------------------------------------------------------


|   USER STORIES  |                                                                                                                 
|------------------------------| 
US01: Como usuário, quero visualizar um mapa interativo para navegar pela área de interesse.
US02: Como usuário, quero clicar em um ponto do mapa para selecionar uma localização exata, para obter informações específicas daquela região.
US03: Como usuário, quero consultar no STAC os satélites que possuem dados gratuitos para o ponto selecionado, para saber quais fontes de dados estão disponíveis.
US04: Como usuário, quero ver as informações detalhadas de cada satélite (nome, resolução espacial, resolução temporal e variáveis disponíveis), para comparar rapidamente qual dado é mais adequado para minha análise.
US05: Como usuário, quero selecionar variáveis específicas (ex.: NDVI, temperatura da superfície, umidade do solo) para um satélite, para analisar os indicadores mais relevantes para minha pesquisa.
US06: Como usuário, quero comparar séries temporais de variáveis semelhantes de diferentes satélites (ex.: NDVI de Sentinel-2 vs Landsat-8), para entender diferenças entre missões e escolher o dado mais apropriado.
US07: Como usuário, quero visualizar essas séries temporais em gráficos lado a lado, para facilitar a análise comparativa de tendências ao longo do tempo.
US08: Como usuário, quero filtrar os resultados exibidos por satélite, variável ou período, para refinar minha busca e evitar excesso de informação.
US09: Como usuário, quero exportar os metadados e séries temporais em formatos como CSV ou JSON, para usar os dados em análises externas.
US10: Como usuário sem experiência em geoprocessamento, quero uma interface simples, clara e responsiva, para navegar facilmente mesmo sem conhecimento técnico avançado.
US11: Como usuário, quero que o sistema carregue rápido e traga dados confiáveis e atualizados, para não perder tempo e ter confiança nos resultados exibidos.
-------------------------------------------------------------------------------------------------

# BURNDOWN SP1
 <div align = center>
 <img src="https://github.com/My0pes/Datlas-3DSM/blob/main/Repositorio/Imagens%20repositorio/burndown-SP1-3DSM.PNG">
 </div>


 
-----------------------------------------------------------------------------------

# WIREFRAME
<img src='https://github.com/My0pes/Datlas-3DSM/blob/main/Repositorio/Imagens%20repositorio/Home.PNG' width='500'>
<img src='https://github.com/My0pes/Datlas-3DSM/blob/main/Repositorio/Imagens%20repositorio/Mapa.PNG' width='500'/>
<img src='https://github.com/My0pes/Datlas-3DSM/blob/main/Repositorio/Imagens%20repositorio/Quem%20somos%20n%C3%B3s.PNG' width='500'/>


-----------------------------------------------------------------------------------

# 🔗 LINKS

### 🧮 JIRA
[Clique Aqui](https://myopes.atlassian.net/jira/software/projects/SCRUM/boards/1)

### 🎨 FIGMA
[Clique Aqui](https://www.figma.com/design/no4r4O5bfFE5hHsAaGSUdF/Untitled?node-id=8-2&t=ZzsFrwYVSUWsnnn9-1)

### ATAS DE ATIVIDADE
[Clique Aqui](https://github.com/My0pes/Datlas-3DSM/tree/main/Repositorio/Atas%20Sprint%201)

# :computer: EQUIPE

|CARGO | NOME| SOCIAL MEDIA |
|------|-----|:--------------:|
| Scrum Master     |  Gustavo    |     <a target="_blank" href="https://github.com/GustavoCastilhoLucena"><img  src="https://skillicons.dev/icons?i=github"></a>|  
|  P.O (Product Owner) |   Danilo Alves   |     <a target="_blank" href="https://github.com/Danilo-Fatec"><img  src="https://skillicons.dev/icons?i=github"></a>|   
| Dev     |   André Luis Alves  |     <a target="_blank" href="https://github.com/andre28122"><img  src="https://skillicons.dev/icons?i=github"></a>|   
| Dev     |   Bruno Maria   |     <a target="_blank" href="https://github.com/BrunoPrince1"><img  src="https://skillicons.dev/icons?i=github"></a>| 
| Dev     |   João Vitor   |     <a target="_blank" href="https://github.com/jvrb"><img  src="https://skillicons.dev/icons?i=github"></a>|  

