import cors from 'cors';
import env from './env.ts';

const origin =
  Array.isArray(env.CORS_ORIGIN) && env.CORS_ORIGIN.includes('*') ? true : env.CORS_ORIGIN;

export default cors({
  origin,
  credentials: true,
  methods: env.CORS_METHODS,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
