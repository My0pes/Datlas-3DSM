import { Router } from "express";
import WtssController from "../controller/WtssController";

const app = Router();

app.get("/", WtssController.searchCoverages);
app.get("/commomAtt", (req, res) => WtssController.attributesCommomCoverages(req, res))
app.post("/search", (req, res) => WtssController.query(req, res))

export default app;
