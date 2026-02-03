import express, { Router } from 'express';

import { BattleController } from '../controllers/BattleController';
import { authenticate } from '../utils/auth';

class BattleRouter {
  public router: Router;

  constructor(battleController: BattleController) {
    this.router = express.Router();

    this.router.route('/').post(authenticate, async (req, res) => {
      await battleController.create(req, res);
    });

    this.router.route('/game/:id').get(authenticate, async (req, res) => {
      await battleController.getBattleByGameId(req, res);
    });

    this.router
      .route('/:id')
      .get(authenticate, async (req, res) => {
        await battleController.get(req, res);
      })
      .delete(authenticate, async (req, res) => {
        await battleController.delete(req, res);
      });

    this.router.route('/:id/action').put(authenticate, async (req, res) => {
      await battleController.action(req, res);
    });
  }
}

export { BattleRouter };
