export type BoxScoreInput = {
  homeScore: number;
  awayScore: number;
  homeFga: number;
  awayFga: number;
  homeTov: number;
  awayTov: number;
  homeFouls?: number;
  awayFouls?: number;
  home3pm?: number;
  away3pm?: number;
  home3pa?: number;
  away3pa?: number;
  homeFta?: number;
  awayFta?: number;
  homeFtm?: number;
  awayFtm?: number;
  homeReb?: number;
  awayReb?: number;
  homeAst?: number;
  awayAst?: number;
  overtimePeriods?: number;
  pace?: number;
};

export function generateBoxScore(gameResult: BoxScoreInput) {
  const pace = gameResult.pace ?? (gameResult.homeFga + gameResult.awayFga) / 2;
  const homePoss = Math.max(1, gameResult.homeFga + (gameResult.homeTov * 0.96));
  const awayPoss = Math.max(1, gameResult.awayFga + (gameResult.awayTov * 0.96));

  return {
    teamStats: {
      home: {
        points: gameResult.homeScore,
        fga: gameResult.homeFga,
        fgm: Math.max(0, gameResult.homeScore - (gameResult.homeFtm ?? 0) - (gameResult.home3pm ?? 0)) / 2 + (gameResult.home3pm ?? 0),
        tpa: gameResult.home3pa ?? 0,
        tpm: gameResult.home3pm ?? 0,
        fta: gameResult.homeFta ?? 0,
        ftm: gameResult.homeFtm ?? 0,
        rebounds: gameResult.homeReb ?? 0,
        assists: gameResult.homeAst ?? 0,
        turnovers: gameResult.homeTov,
        fouls: gameResult.homeFouls ?? 0,
        offensiveEfficiency: (gameResult.homeScore / homePoss) * 100,
        defensiveEfficiency: (gameResult.awayScore / awayPoss) * 100,
      },
      away: {
        points: gameResult.awayScore,
        fga: gameResult.awayFga,
        fgm: Math.max(0, gameResult.awayScore - (gameResult.awayFtm ?? 0) - (gameResult.away3pm ?? 0)) / 2 + (gameResult.away3pm ?? 0),
        tpa: gameResult.away3pa ?? 0,
        tpm: gameResult.away3pm ?? 0,
        fta: gameResult.awayFta ?? 0,
        ftm: gameResult.awayFtm ?? 0,
        rebounds: gameResult.awayReb ?? 0,
        assists: gameResult.awayAst ?? 0,
        turnovers: gameResult.awayTov,
        fouls: gameResult.awayFouls ?? 0,
        offensiveEfficiency: (gameResult.awayScore / awayPoss) * 100,
        defensiveEfficiency: (gameResult.homeScore / homePoss) * 100,
      },
    },
    playerStats: [],
    metadata: {
      finalScore: `${gameResult.homeScore}-${gameResult.awayScore}`,
      overtimePeriods: gameResult.overtimePeriods ?? 0,
      pace,
    },
  };
}
