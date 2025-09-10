import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

import { configs } from './configs/config';
import { jobRunner } from './crons';
import { ApiError } from './errors/api-error';
import { authRouter, purchaseListRouter, userRouter } from './routers';
import swaggerRouter from './swagger';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, configs.JWT_ACCESS_SECRET) as {
      userId: string;
    };
    socket.data.userId = decoded.userId;
    socket.join(decoded.userId);
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).io = io;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/purchase-list', purchaseListRouter);
app.use(swaggerRouter);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((error: ApiError, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500).json({ message: error.message });
});

process.on('uncaughtException', (e) => {
  console.error('uncaughtException', e.message, e.stack);
  process.exit(1);
});

httpServer.listen(configs.API_PORT, configs.API_HOST, async () => {
  await mongoose.connect(configs.DB_URI);
  console.log(
    `Server is running at http://${configs.API_HOST}:${configs.API_PORT}`,
  );
  console.log(
    `Swagger is running at http://${configs.API_HOST}:${configs.API_PORT}/api-docs`,
  );
  jobRunner();
});

io.on('connection', (socket) => {
  socket.onAny((event, ...args) => {
    console.log(`Received event ${event}:`, args);
  });
  const userId = socket.data.userId;
  console.log('Нове сокет-з’єднання:', socket.id, 'User ID:', userId);

  socket.emit('hello', { msg: 'Привіт з сервера!' });

  socket.on('disconnect', () => {
    console.log('Сокет відключився:', socket.id);
  });
});

export { io };
