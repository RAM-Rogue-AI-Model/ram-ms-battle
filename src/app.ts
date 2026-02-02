import express from 'express';
import 'dotenv/config';
import battleRoutes from './routes/battleRoutes';

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());
app.use('/battle', battleRoutes);

app.get('/health', (req, res) => {
  res.send('Battle Service Ready');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});
