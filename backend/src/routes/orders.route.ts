import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', OrdersController.list);
router.post('/', OrdersController.create);
router.get('/:id', OrdersController.get);
router.post('/:id/status', OrdersController.updateStatus);
router.post('/:id/print', OrdersController.printOrder);

export { router as ordersRouter };
