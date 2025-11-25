import express from "express";
import path from "path";
import wtssRoutes from "./routes/WtssRoutes";
import cors from "cors"


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())

app.use("/wtss", wtssRoutes);

app.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
});
