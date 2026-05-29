import express, { json, Application } from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route';
import { ordersRouter } from './routes/orders.route';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { config } from './config';

const app: Application = express();

// 1. Configuração de CORS: 
// Permitimos todas as origens para desenvolvimento. 
// Em produção, substitua '*' pelo domínio do seu frontend.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Parsers de corpo da requisição
app.use(json());

// 3. Logger de requisições (deve vir antes das rotas)
app.use(requestLogger);

// 4. Rota de Health Check (útil para monitorar se o backend está vivo)
app.get('/api/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 5. Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

// 6. Middleware de tratamento de erros (deve ser o último a ser declarado)
app.use(errorHandler);

export { app, config };