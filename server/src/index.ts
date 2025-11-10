import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Olá do backend!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
