import express, { NextFunction, Request, Response } from 'express';
import * as mongoose from 'mongoose';

import { configs } from './configs/config';
import { ApiError } from './errors/api-error';
import { authRouter, userRouter } from './routers';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use(
  '*',
  (error: ApiError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500).json(error.message);
  },
);

process.on('uncaughtException', (e) => {
  console.error('uncaughtException', e.message, e.stack);
  process.exit(1);
});

app.listen(configs.API_PORT, configs.API_HOST, async () => {
  await mongoose.connect(configs.DB_URI);
  console.log(
    `Server is running at http://${configs.API_HOST}:${configs.API_PORT}`,
  );
});
