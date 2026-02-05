import 'express-async-errors';
import http from 'http';
import env from './utils/env.ts';
import express from './utils/express.ts';
import { setHealthy, getPendingRequests } from './utils/health-state.ts';
import { testConnection } from './utils/database.ts';

const startServer = async (): Promise<void> => {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Server will not start.');
    process.exit(1);
  }

  const server = http.createServer(express).listen(env.LISTENING_PORT, () => {
    console.log(`Spider backend listening on port ${env.LISTENING_PORT}`);
  });

  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`Received ${signal}, starting graceful shutdown...`);
    setHealthy(false);

    const drainTime = 5000;
    await new Promise<void>(r => {
      setTimeout(r, drainTime);
    });

    server.close(() => {
      console.log('HTTP server closed');
    });

    const timeoutMs = 10000;
    const checkIntervalMs = 200;
    const started = Date.now();

    while (Date.now() - started < timeoutMs) {
      if (getPendingRequests() === 0) {
        console.log('All requests completed, exiting');
        process.exit(0);
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>(r => {
        setTimeout(r, checkIntervalMs);
      });
    }

    console.log('Graceful shutdown timeout reached, forcing exit');
    process.exit(0);
  };

  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
