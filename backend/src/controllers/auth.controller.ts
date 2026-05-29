import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const token = await AuthService.login(username, password);
      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
}
