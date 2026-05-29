import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

export class OrdersController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const status = String(req.query.status || '');
      const search = String(req.query.search || '');
      const sort = String(req.query.sort || 'desc');
      const orders = await OrderService.list({ status, search, sort });
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Number(req.params.id);
      const order = await OrderService.get(orderId);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createManualOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;
      const order = await OrderService.updateStatus(orderId, status);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  static async printOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Number(req.params.id);
      const ticket = await OrderService.printOrder(orderId);
      res.json({ ticket });
    } catch (error) {
      next(error);
    }
  }
}
                                                                                                                                                                                  