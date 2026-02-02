import { Router } from 'express';
import { BattleController } from '../controllers/BattleController';

const router = Router();
const controller = new BattleController();

router.post('/', controller.create.bind(controller));
router.get('/:id', controller.get.bind(controller));
router.put('/:id/action', controller.action.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
