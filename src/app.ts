import fs from 'node:fs';

import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as YAML from 'yaml';

import { BattleController } from './controllers/BattleController';
import { BattleRouter } from './routes/BattleRouter';
import { BattleService } from './services/BattleService';
import { config } from './utils/config';

const app = express();
const port = process.env.PORT ?? 3002;

app.use(express.json());

app.use(
  cors({
    origin: [config.API_GATEWAY_URL],
    credentials: true,
  })
);

const battleService = new BattleService();
const battleController = new BattleController(battleService);

app.use('/battle', new BattleRouter(battleController).router);

const file = fs.readFileSync('./openapi.yml', 'utf8');
const swaggerDocument = YAML.parse(file) as object;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`docs available at http://localhost:${port}/docs`);
});
