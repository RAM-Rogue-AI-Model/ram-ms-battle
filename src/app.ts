import 'dotenv/config';

import express from 'express';

import { BattleController } from './controllers/BattleController';
import { BattleRouter } from './routes/BattleRouter';
import { BattleService } from './services/BattleService';

const app = express();
const port = process.env.PORT ?? 3002;

app.use(express.json());

const battleService = new BattleService();
const battleController = new BattleController(battleService);

app.use('/battle', new BattleRouter(battleController).router);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});
