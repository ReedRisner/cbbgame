import { Router } from 'express';
import { prisma, parsePagination } from './_db';

const router = Router();

router.get('/', async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query as any);
  const position = req.query.position as any;
  const classYear = req.query.classYear as any;
  const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;
  const minOverall = req.query.minOverall ? Number(req.query.minOverall) : undefined;

  const where: any = {
    ...(position ? { position } : {}),
    ...(classYear ? { classYear } : {}),
    ...(teamId ? { teamId } : {}),
    ...(minOverall ? { trueOverall: { gte: minOverall } } : {})
  };

  const [total, players] = await Promise.all([
    prisma.player.count({ where }),
    prisma.player.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { trueOverall: 'desc' },
      include: { team: true }
    })
  ]);

  res.json({ page, pageSize, total, data: players.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    team: p.team.name,
    teamId: p.teamId,
    position: p.position,
    classYear: p.classYear,
    overall: p.trueOverall,
    heightInches: p.heightInches
  }))});
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const p = await prisma.player.findUnique({ where: { id }, include: { team: true } });
  if (!p) return res.status(404).json({ error: 'Player not found' });

  const injuryLabel = p.injuryProneness < 35 ? 'Durable' : p.injuryProneness < 65 ? 'Average' : 'Fragile';
  const consistencyLabel = p.consistency > 70 ? 'Steady' : p.consistency > 45 ? 'Average' : 'Volatile';
  const nbaInterest = p.nbaPotential > 75 ? 'High' : p.nbaPotential > 50 ? 'Moderate' : 'Low';

  res.json({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    team: { id: p.team.id, name: p.team.name },
    position: p.position,
    classYear: p.classYear,
    heightInches: p.heightInches,
    weight: p.weight,
    physical: { speed: p.speed, vertical: p.vertical, stamina: p.stamina, weight: p.weight },
    skills: {
      insideScoring: p.insideScoring, midRange: p.midRange, threePoint: p.threePoint, freeThrow: p.freeThrow,
      layup: p.layup, postMoves: p.postMoves, ballHandling: p.ballHandling, passing: p.passing, courtVision: p.courtVision,
      perimeterDefense: p.perimeterDefense, interiorDefense: p.interiorDefense, steal: p.steal, block: p.block,
      rebounding: p.rebounding, offensiveIQ: p.offensiveIQ, defensiveIQ: p.defensiveIQ, shotCreation: p.shotCreation, pickAndRoll: p.pickAndRoll
    },
    tendencies: {
      shotTendency: p.shotTendency, driveTendency: p.driveTendency, passTendency: p.passTendency, postTendency: p.postTendency,
      transitionTendency: p.transitionTendency, foulTendency: p.foulTendency, hustleTendency: p.hustleTendency, riskTendency: p.riskTendency
    },
    personality: {
      workEthic: p.workEthic, leadership: p.leadership, coachability: p.coachability, discipline: p.discipline,
      loyalty: p.loyalty, competitiveness: p.competitiveness, composure: p.composure
    },
    status: {
      yearsRemaining: p.yearsRemaining,
      redshirt: p.isRedshirt,
      injuryLabel,
      consistencyLabel,
      nbaInterest: nbaInterest === 'Low' ? null : nbaInterest
    }
  });
});

export default router;
