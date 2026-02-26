export function generateBoxScore(gameResult: { homeScore: number; awayScore: number; homeFga: number; awayFga: number; homeTov: number; awayTov: number }) {
  return {
    teamStats: {
      home: { points: gameResult.homeScore, fga: gameResult.homeFga, turnovers: gameResult.homeTov },
      away: { points: gameResult.awayScore, fga: gameResult.awayFga, turnovers: gameResult.awayTov },
    },
    playerStats: [],
    metadata: {},
  };
}
