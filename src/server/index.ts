import express from 'express';
import dotenv from 'dotenv';
import claudeRouter from './api/claude';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use('/api', claudeRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 