import { Router } from 'express';

const router = Router();

router.get('/analytics', (_req, res) => {
  // Return dummy analytics
  res.json({ users: 120, activeTests: 4, avgAccuracy: 0.72 });
});

export default router;
