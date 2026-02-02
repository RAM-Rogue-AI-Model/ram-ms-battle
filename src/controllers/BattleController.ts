import { Request, Response } from 'express';
import { BattleService } from '../services/BattleService';

const battleService = new BattleService();

export class BattleController {
    async create(req: Request, res: Response) {
        try {
            const result = await battleService.createBattle(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async get(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const result = await battleService.getBattle(id);
            if (!result) {
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
            const result = await battleService.performAction(id, req.body);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await battleService.deleteBattle(id);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
