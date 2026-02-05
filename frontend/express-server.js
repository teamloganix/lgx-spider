import express from 'express';
import morgan from 'morgan';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import { handler as astroSsrHandler } from './dist/server/entry.mjs';
import sppLogin from './express-middlewares/spp-login.js';
import jwtCookie from './express-middlewares/jwt-cookie.js';
import env from './express-middlewares/env.js';

const app = express();
const MOUNT_PATH = env.MOUNT_PATH;

morgan.token('status', (req, res) => {
  const code = res.statusCode || 0;
  if (code < 300) return chalk.green(code);
  if (code < 400) return chalk.yellow(code);
  if (code < 500) return chalk.red(code);
  return chalk.white.bgRed(code);
});
morgan.token('response-time', (req, res) => {
  if (!req._startAt || !res._startAt) return '-';
  const ms = ((res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6).toFixed(3);
  return chalk.gray(`${ms}ms`);
});

let healthy = true;
app.use((req, res, next) => {
  req._startAt = process.hrtime();
  res.on('finish', () => { res._startAt = process.hrtime(); });
  next();
});
app.use(morgan('[:date[iso]] (:status) :method :url - :response-time'));

app.get('/health', (_req, res) => {
  res.status(healthy ? 200 : 503).send(healthy ? 'ok' : 'shutting down');
});

app.use(MOUNT_PATH, express.static('dist/client/', { maxAge: 1296000 }));
app.use(MOUNT_PATH, sppLogin());
app.use(MOUNT_PATH, cookieParser());
app.use(MOUNT_PATH, jwtCookie());
app.use(MOUNT_PATH, (req, res, next) => {
  const locals = { user: req.user };
  return astroSsrHandler(req, res, next, locals);
});

app.use((err, _req, res, _next) => {
  console.error('[express] error:', err);
  res.status(500).send('Internal server error');
});

const server = app.listen(process.env.SERVER_HTTP_PORT || 4321, '0.0.0.0', () => {
  console.log(`Spider frontend: http://localhost:${process.env.SERVER_HTTP_PORT || 4321}`);
});

const gracefulShutdown = async (signal) => {
  healthy = false;
  server.close(() => console.log('Server closed'));
  await new Promise((r) => setTimeout(r, 2000));
  process.exit(0);
};
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
