import { Router } from 'express';
import { prisma } from './_db';

const router = Router();

router.get('/log/:season', async (req, res) => {
  const season = Number(req.params.season);
  res.json(await prisma.tamperingLog.findMany({ where: { season } }));
});

export default router;
