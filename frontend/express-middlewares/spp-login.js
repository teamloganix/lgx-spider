import express from "express";

/**
 * Placeholder SPP login router for Spider.
 * No-op for now. Replace with real SPP login when needed.
 */
export default function sppLogin() {
  const router = express.Router();
  router.use((_req, _res, next) => next());
  return router;
}
