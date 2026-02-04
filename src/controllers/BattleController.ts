import { Request, Response } from 'express';

import { BattleService } from '../services/BattleService';
import { Action } from '../types/Action';
import { Battle } from '../types/Battle';
import { CreateBattleInput } from '../types/battleTypes';

export class BattleController {
  battleService: BattleService;

  constructor(service: BattleService) {
    this.battleService = service;
  }

  private validateCreateBody(body: unknown): string[] {
    const errors: string[] = [];

    if (body === undefined || body === null) {
      errors.push('body is required');
      return errors;
    }

    if (typeof body !== 'object' || Array.isArray(body)) {
      errors.push('body must be an object');
      return errors;
    }

    const b = body as Record<string, unknown>;

    if (!Array.isArray(b.enemy)) {
      errors.push('enemy must be an array');
    } else if ((b.enemy as unknown[]).length === 0) {
      errors.push('enemy must not be an empty array');
    }

    if (!Array.isArray(b.effect)) {
      errors.push('effect must be an array');
    }

    if (
      typeof b.player !== 'object' ||
      b.player === null ||
      Array.isArray(b.player)
    ) {
      errors.push('player must be an object');
    }

    if (typeof b.pv !== 'number') {
      errors.push('PV must be a number');
    }

    if (typeof b.level_dungeon !== 'number') {
      errors.push('level_dungeon must be a number');
    }

    if (typeof b.game_id !== 'string') {
      errors.push('game_id must be a string');
    }

    return errors;
  }

  async create(req: Request, res: Response) {
    try {
      const body = req.body as CreateBattleInput;

      const errors = this.validateCreateBody(body);
      if (errors.length > 0) {
        res
          .status(400)
          .json({ error: 'Invalid request body', details: errors });
        return;
      }

      const result = await this.battleService.createBattle(body);
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result: Battle | null = await this.battleService.getBattle(id);
      if (result == null) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async action(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const body = req.body as Action;
      const result = await this.battleService.performAction(id, body);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await this.battleService.deleteBattle(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getBattleByGameId(req: Request, res: Response) {
    try {
      const gameId = req.params.id as string;
      const battle = await this.battleService.getBattleByGameId(gameId);
      if(battle == null){
        res.status(404).json({ error: 'Battle not found' });
        return;
      }
      res.json(battle);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const body = req.body as CreateBattleInput;
      const result = await this.battleService.updateBattle(id, body);
      if (result == null) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      res.json(result);
    }catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

}
