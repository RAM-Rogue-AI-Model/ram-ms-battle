import express, { Router } from 'express';

import { BattleController } from '../controllers/BattleController';
import { authenticate, requestDetails } from '../utils/auth';

class BattleRouter {
  public router: Router;

  constructor(battleController: BattleController) {
    this.router = express.Router();

    this.router
      .route('/')
      .post(requestDetails, authenticate, async (req, res) => {
        await battleController.create(req, res);
      });

    this.router
      .route('/game/:id')
      .get(requestDetails, authenticate, async (req, res) => {
        await battleController.getBattleByGameId(req, res);
      });

    this.router
      .route('/:id')
      .get(requestDetails, authenticate, async (req, res) => {
        await battleController.get(req, res);
      })
      .put(authenticate, async (req, res) => {
        await battleController.update(req, res);
      })
      .delete(requestDetails, authenticate, async (req, res) => {
        await battleController.delete(req, res);
      });

    this.router
      .route('/:id/action')
      .put(requestDetails, authenticate, async (req, res) => {
        await battleController.action(req, res);
      });
  }
}

export { BattleRouter };
