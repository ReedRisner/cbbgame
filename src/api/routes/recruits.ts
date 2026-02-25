import { Router } from 'express';
import { prisma, parsePagination } from './_db';

const router = Router();

function rangeFor(value: number, spread: number): [number, number] {
  return [Math.max(20, Math.round(value - spread)), Math.min(99, Math.round(value + spread))];
}

router.get('/', async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query as any);
  const starRating = req.query.starRating ? Number(req.query.starRating) : undefined;
  const position = req.query.position as any;
  const state = req.query.state as string | undefined;

  const where: any = {
    ...(starRating ? { starRating } : {}),
    ...(position ? { position } : {}),
    ...(state ? { state } : {})
  };

  const [total, recruits] = await Promise.all([
    prisma.recruit.count({ where }),
    prisma.recruit.findMany({ where, skip, take: pageSize, orderBy: [{ starRating: 'desc' }, { compositeScore: 'desc' }] })
  ]);

  res.json({
    page,
    pageSize,
    total,
    data: recruits.map((r) => {
      const spread = Math.max(4, Math.round(8 * r.uncertaintyMultiplier));
      const [ovMin, ovMax] = rangeFor(r.scoutedOverall, spread);
      const [potMin, potMax] = rangeFor(r.scoutedPotential, spread);
      return {
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        position: r.position,
        starRating: r.starRating,
        compositeScore: r.compositeScore,
        state: r.state,
        scoutedOverallRange: [ovMin, ovMax],
        scoutedPotentialRange: [potMin, potMax]
      };
    })
  });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const r = await prisma.recruit.findUnique({ where: { id } });
  if (!r) return res.status(404).json({ error: 'Recruit not found' });

  const spread = Math.max(4, Math.round(10 * r.uncertaintyMultiplier));
  const skillEntries = Object.entries({
    speed: r.speed, acceleration: r.acceleration, strength: r.strength, vertical: r.vertical, stamina: r.stamina,
    insideScoring: r.insideScoring, midRange: r.midRange, threePoint: r.threePoint, ballHandling: r.ballHandling,
    passing: r.passing, perimeterDefense: r.perimeterDefense, interiorDefense: r.interiorDefense, rebounding: r.rebounding
  }).map(([k, v]) => ({ key: k, range: rangeFor(v as number, spread) }));

  const personalitySpread = r.type === 'JUCO' ? 10 : r.type === 'INTERNATIONAL' ? 14 : 12;
  const personality = {
    workEthic: rangeFor(r.workEthic, personalitySpread),
    leadership: rangeFor(r.leadership, personalitySpread),
    coachability: rangeFor(r.coachability, personalitySpread),
    loyalty: rangeFor(r.loyalty, personalitySpread)
  };

  res.json({
    id: r.id,
    name: `${r.firstName} ${r.lastName}`,
    hometown: `${r.hometown}, ${r.state}`,
    position: r.position,
    starRating: r.starRating,
    physical: { heightInches: r.heightInches, weight: r.weight },
    scouted: {
      overallRange: rangeFor(r.scoutedOverall, spread),
      potentialRange: rangeFor(r.scoutedPotential, spread),
      attributes: skillEntries,
      personality
    }
  });
});

export default router;
