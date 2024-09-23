import dotenv from 'dotenv';

dotenv.config();

export const configs = {
  API_PORT: Number(process.env.API_PORT) || 3005,
  API_HOST: process.env.API_HOST,
  DB_URI: process.env.DB_URI,
};
