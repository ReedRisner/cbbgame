-- CreateEnum
CREATE TYPE "TeamTier" AS ENUM ('POWER4', 'UPPER_MID', 'MID', 'LOW_MAJOR');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('PG', 'SG', 'SF', 'PF', 'C');

-- CreateEnum
CREATE TYPE "ClassYear" AS ENUM ('FR', 'SO', 'JR', 'SR', 'GR');

-- CreateEnum
CREATE TYPE "RecruitType" AS ENUM ('HS', 'JUCO', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "DevelopmentCurve" AS ENUM ('EARLY_BLOOMER', 'STANDARD', 'LATE_BLOOMER', 'BUST', 'FREAK_LEAP');

-- CreateEnum
CREATE TYPE "CoachRole" AS ENUM ('HEAD', 'OC', 'DC', 'RECRUITING_COORDINATOR', 'PLAYER_DEVELOPMENT');

-- CreateTable
CREATE TABLE "Conference" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "tier" "TeamTier" NOT NULL,
    "prestige" DOUBLE PRECISION NOT NULL,
    "mediaDealValue" DOUBLE PRECISION NOT NULL,
    "tournamentFormat" TEXT NOT NULL,
    "autoBidValue" DOUBLE PRECISION NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "tourneySuccess" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "historicalWeight" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "mascot" TEXT,
    "conferenceId" INTEGER NOT NULL,
    "currentPrestige" DOUBLE PRECISION NOT NULL,
    "historicalPrestige" DOUBLE PRECISION NOT NULL,
    "facilityRating" DOUBLE PRECISION NOT NULL,
    "nilCollectiveStrength" DOUBLE PRECISION NOT NULL,
    "boosterBudget" DOUBLE PRECISION NOT NULL,
    "mediaMarket" DOUBLE PRECISION NOT NULL,
    "fanIntensity" DOUBLE PRECISION NOT NULL,
    "arenaCapacity" INTEGER NOT NULL,
    "academicRating" DOUBLE PRECISION NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "rivalries" JSONB NOT NULL,
    "tourneySuccessScore" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "mediaBuzz" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "underperformanceYears" INTEGER NOT NULL DEFAULT 0,
    "rolling10YearPrestige" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "hometown" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "position" "Position" NOT NULL,
    "classYear" "ClassYear" NOT NULL,
    "age" INTEGER NOT NULL,
    "heightInches" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "acceleration" DOUBLE PRECISION NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "vertical" DOUBLE PRECISION NOT NULL,
    "stamina" DOUBLE PRECISION NOT NULL,
    "durability" DOUBLE PRECISION NOT NULL,
    "insideScoring" DOUBLE PRECISION NOT NULL,
    "midRange" DOUBLE PRECISION NOT NULL,
    "threePoint" DOUBLE PRECISION NOT NULL,
    "freeThrow" DOUBLE PRECISION NOT NULL,
    "layup" DOUBLE PRECISION NOT NULL,
    "postMoves" DOUBLE PRECISION NOT NULL,
    "ballHandling" DOUBLE PRECISION NOT NULL,
    "passing" DOUBLE PRECISION NOT NULL,
    "courtVision" DOUBLE PRECISION NOT NULL,
    "perimeterDefense" DOUBLE PRECISION NOT NULL,
    "interiorDefense" DOUBLE PRECISION NOT NULL,
    "steal" DOUBLE PRECISION NOT NULL,
    "block" DOUBLE PRECISION NOT NULL,
    "rebounding" DOUBLE PRECISION NOT NULL,
    "offensiveIQ" DOUBLE PRECISION NOT NULL,
    "defensiveIQ" DOUBLE PRECISION NOT NULL,
    "shotCreation" DOUBLE PRECISION NOT NULL,
    "pickAndRoll" DOUBLE PRECISION NOT NULL,
    "shotTendency" DOUBLE PRECISION NOT NULL,
    "driveTendency" DOUBLE PRECISION NOT NULL,
    "passTendency" DOUBLE PRECISION NOT NULL,
    "postTendency" DOUBLE PRECISION NOT NULL,
    "transitionTendency" DOUBLE PRECISION NOT NULL,
    "foulTendency" DOUBLE PRECISION NOT NULL,
    "hustleTendency" DOUBLE PRECISION NOT NULL,
    "riskTendency" DOUBLE PRECISION NOT NULL,
    "workEthic" DOUBLE PRECISION NOT NULL,
    "leadership" DOUBLE PRECISION NOT NULL,
    "coachability" DOUBLE PRECISION NOT NULL,
    "discipline" DOUBLE PRECISION NOT NULL,
    "loyalty" DOUBLE PRECISION NOT NULL,
    "competitiveness" DOUBLE PRECISION NOT NULL,
    "composure" DOUBLE PRECISION NOT NULL,
    "injuryProneness" DOUBLE PRECISION NOT NULL,
    "consistency" DOUBLE PRECISION NOT NULL,
    "clutch" DOUBLE PRECISION NOT NULL,
    "growthVariance" DOUBLE PRECISION NOT NULL,
    "nbaPotential" DOUBLE PRECISION NOT NULL,
    "academicDiscipline" DOUBLE PRECISION NOT NULL,
    "trueOverall" DOUBLE PRECISION NOT NULL,
    "truePotential" DOUBLE PRECISION NOT NULL,
    "developmentCurve" "DevelopmentCurve" NOT NULL,
    "yearsRemaining" INTEGER NOT NULL,
    "isRedshirt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "parentCoachId" INTEGER,
    "role" "CoachRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "offense" DOUBLE PRECISION NOT NULL,
    "defense" DOUBLE PRECISION NOT NULL,
    "recruiting" DOUBLE PRECISION NOT NULL,
    "development" DOUBLE PRECISION NOT NULL,
    "discipline" DOUBLE PRECISION NOT NULL,
    "adaptability" DOUBLE PRECISION NOT NULL,
    "analytics" DOUBLE PRECISION NOT NULL,
    "charisma" DOUBLE PRECISION NOT NULL,
    "programBuilding" DOUBLE PRECISION NOT NULL,
    "gameManagement" DOUBLE PRECISION NOT NULL,
    "integrity" DOUBLE PRECISION NOT NULL,
    "pace" DOUBLE PRECISION NOT NULL,
    "spacing" DOUBLE PRECISION NOT NULL,
    "pressureDefense" DOUBLE PRECISION NOT NULL,
    "crashBoards" DOUBLE PRECISION NOT NULL,
    "transitionFocus" DOUBLE PRECISION NOT NULL,
    "pickAndRollUsage" DOUBLE PRECISION NOT NULL,
    "zoneRate" DOUBLE PRECISION NOT NULL,
    "benchDepthTrust" DOUBLE PRECISION NOT NULL,
    "contractYears" INTEGER NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "buyout" DOUBLE PRECISION NOT NULL,
    "careerWins" INTEGER NOT NULL,
    "careerLosses" INTEGER NOT NULL,
    "careerTournamentWins" INTEGER NOT NULL,
    "hiringSeason" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLog" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "pace" DOUBLE PRECISION NOT NULL,
    "overtime" BOOLEAN NOT NULL DEFAULT false,
    "isTournament" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GameLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGameStat" (
    "id" SERIAL NOT NULL,
    "gameLogId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "minutes" DOUBLE PRECISION NOT NULL,
    "points" INTEGER NOT NULL,
    "rebounds" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "steals" INTEGER NOT NULL,
    "blocks" INTEGER NOT NULL,
    "turnovers" INTEGER NOT NULL,
    "fouls" INTEGER NOT NULL,
    "fgMade" INTEGER NOT NULL,
    "fgAttempted" INTEGER NOT NULL,
    "tpMade" INTEGER NOT NULL,
    "tpAttempted" INTEGER NOT NULL,
    "ftMade" INTEGER NOT NULL,
    "ftAttempted" INTEGER NOT NULL,

    CONSTRAINT "PlayerGameStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruit" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "type" "RecruitType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "hometown" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "position" "Position" NOT NULL,
    "age" INTEGER NOT NULL,
    "heightInches" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "eligibilityYears" INTEGER NOT NULL,
    "immediateEligibility" BOOLEAN NOT NULL DEFAULT false,
    "visaDelayRisk" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilDiscount" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "uncertaintyMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "speed" DOUBLE PRECISION NOT NULL,
    "acceleration" DOUBLE PRECISION NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,
    "vertical" DOUBLE PRECISION NOT NULL,
    "stamina" DOUBLE PRECISION NOT NULL,
    "durability" DOUBLE PRECISION NOT NULL,
    "insideScoring" DOUBLE PRECISION NOT NULL,
    "midRange" DOUBLE PRECISION NOT NULL,
    "threePoint" DOUBLE PRECISION NOT NULL,
    "freeThrow" DOUBLE PRECISION NOT NULL,
    "layup" DOUBLE PRECISION NOT NULL,
    "postMoves" DOUBLE PRECISION NOT NULL,
    "ballHandling" DOUBLE PRECISION NOT NULL,
    "passing" DOUBLE PRECISION NOT NULL,
    "courtVision" DOUBLE PRECISION NOT NULL,
    "perimeterDefense" DOUBLE PRECISION NOT NULL,
    "interiorDefense" DOUBLE PRECISION NOT NULL,
    "steal" DOUBLE PRECISION NOT NULL,
    "block" DOUBLE PRECISION NOT NULL,
    "rebounding" DOUBLE PRECISION NOT NULL,
    "offensiveIQ" DOUBLE PRECISION NOT NULL,
    "defensiveIQ" DOUBLE PRECISION NOT NULL,
    "shotCreation" DOUBLE PRECISION NOT NULL,
    "pickAndRoll" DOUBLE PRECISION NOT NULL,
    "shotTendency" DOUBLE PRECISION NOT NULL,
    "driveTendency" DOUBLE PRECISION NOT NULL,
    "passTendency" DOUBLE PRECISION NOT NULL,
    "postTendency" DOUBLE PRECISION NOT NULL,
    "transitionTendency" DOUBLE PRECISION NOT NULL,
    "foulTendency" DOUBLE PRECISION NOT NULL,
    "hustleTendency" DOUBLE PRECISION NOT NULL,
    "riskTendency" DOUBLE PRECISION NOT NULL,
    "workEthic" DOUBLE PRECISION NOT NULL,
    "leadership" DOUBLE PRECISION NOT NULL,
    "coachability" DOUBLE PRECISION NOT NULL,
    "discipline" DOUBLE PRECISION NOT NULL,
    "loyalty" DOUBLE PRECISION NOT NULL,
    "competitiveness" DOUBLE PRECISION NOT NULL,
    "composure" DOUBLE PRECISION NOT NULL,
    "trueOverall" DOUBLE PRECISION NOT NULL,
    "truePotential" DOUBLE PRECISION NOT NULL,
    "scoutedOverall" DOUBLE PRECISION NOT NULL,
    "scoutedPotential" DOUBLE PRECISION NOT NULL,
    "measurablesScore" DOUBLE PRECISION NOT NULL,
    "eventPerformance" DOUBLE PRECISION NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL,
    "starRating" INTEGER NOT NULL,
    "signedTeamId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NilContract" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "annualValue" DOUBLE PRECISION NOT NULL,
    "years" INTEGER NOT NULL,
    "brandScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NilContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "fromTeamId" INTEGER NOT NULL,
    "toTeamId" INTEGER,
    "season" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "immediateEligible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "awardType" TEXT NOT NULL,
    "teamId" INTEGER,
    "playerId" INTEGER,
    "coachId" INTEGER,
    "conferenceId" INTEGER,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingsHistory" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "conferenceId" INTEGER,
    "teamId" INTEGER,
    "rank" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RankingsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonRecord" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "conferenceWins" INTEGER NOT NULL,
    "conferenceLosses" INTEGER NOT NULL,
    "tournamentWins" INTEGER NOT NULL,
    "postseasonRound" TEXT,
    "apPeakRank" INTEGER,

    CONSTRAINT "SeasonRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingChange" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "outgoingCoachId" INTEGER,
    "incomingCoachId" INTEGER,
    "reason" TEXT NOT NULL,

    CONSTRAINT "CoachingChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConferenceMembershipHistory" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "conferenceId" INTEGER NOT NULL,
    "startSeason" INTEGER NOT NULL,
    "endSeason" INTEGER,

    CONSTRAINT "ConferenceMembershipHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sanction" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "severity" DOUBLE PRECISION NOT NULL,
    "scholarshipReduction" INTEGER NOT NULL,
    "postseasonBan" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "Sanction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftHistory" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "draftRound" INTEGER NOT NULL,
    "draftPick" INTEGER NOT NULL,
    "nbaTeam" TEXT NOT NULL,

    CONSTRAINT "DraftHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "season" INTEGER NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "conferenceId" INTEGER,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "isConferenceGame" BOOLEAN NOT NULL,
    "isTournamentGame" BOOLEAN NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conference_name_key" ON "Conference"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_parentCoachId_fkey" FOREIGN KEY ("parentCoachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLog" ADD CONSTRAINT "GameLog_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLog" ADD CONSTRAINT "GameLog_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_gameLogId_fkey" FOREIGN KEY ("gameLogId") REFERENCES "GameLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruit" ADD CONSTRAINT "Recruit_signedTeamId_fkey" FOREIGN KEY ("signedTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilContract" ADD CONSTRAINT "NilContract_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilContract" ADD CONSTRAINT "NilContract_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromTeamId_fkey" FOREIGN KEY ("fromTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toTeamId_fkey" FOREIGN KEY ("toTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingsHistory" ADD CONSTRAINT "RankingsHistory_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRecord" ADD CONSTRAINT "SeasonRecord_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingChange" ADD CONSTRAINT "CoachingChange_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingChange" ADD CONSTRAINT "CoachingChange_outgoingCoachId_fkey" FOREIGN KEY ("outgoingCoachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingChange" ADD CONSTRAINT "CoachingChange_incomingCoachId_fkey" FOREIGN KEY ("incomingCoachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceMembershipHistory" ADD CONSTRAINT "ConferenceMembershipHistory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConferenceMembershipHistory" ADD CONSTRAINT "ConferenceMembershipHistory_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftHistory" ADD CONSTRAINT "DraftHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftHistory" ADD CONSTRAINT "DraftHistory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
