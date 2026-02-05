import morgan from 'morgan';
import chalk from 'chalk';
import type { Request, Response } from 'express';

morgan.token('user-agent', (req: Request) => chalk.gray(req.headers['user-agent'] ?? ''));
morgan.token('remote-addr', (req: Request) =>
  chalk.black.bgWhite(req.headers['cf-connecting-ip'] ?? req.ip ?? '')
);
morgan.token('status', (_req: Request, res: Response) => {
  const code = res.statusCode;
  if (code < 300) return chalk.green(code);
  if (code < 400) return chalk.yellow(code);
  if (code < 500) return chalk.red(code);
  return chalk.white.bgRed(code);
});
morgan.token('response-time', (req: Request, res: Response) => {
  const start = (req as any)._startAt;
  const end = (res as any)._startAt;
  if (!start || !end) return '';
  const ms = (end[0] - start[0]) * 1e3 + (end[1] - start[1]) * 1e-6;
  const t = parseFloat(ms.toFixed(3));
  if (t < 200) return chalk.green(`${t}ms`);
  if (t < 600) return chalk.yellow(`${t}ms`);
  return chalk.red(`${t}ms`);
});

export default morgan(
  '[:date[iso]] (:status) :method :url - :response-time - :remote-addr | :user-agent'
);
