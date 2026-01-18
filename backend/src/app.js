import express from 'express';
import cors from 'cors';

import apiRouter from './routes/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);
app.get('/', (req, res) => {
  res.send('Luna Backend is running. Visit /api for endpoints.');
});

export default app;
