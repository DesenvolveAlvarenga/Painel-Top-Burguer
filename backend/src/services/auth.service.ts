import jwt from 'jsonwebtoken';
import { config } from '../config';
import { users } from '../models/user.model';

export class AuthService {
  static async login(username: string, password: string) {
    const user = users.find((item) => item.username === username && item.password === password);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      config.jwtSecret,
      { expiresIn: '8h' }
    );
  }
}
